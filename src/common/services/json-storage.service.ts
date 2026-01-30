import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  BaseEntity,
  PaginatedResponse,
  PaginationOptions,
} from '../interfaces';

/**
 * JsonStorageService handles all file-based data persistence operations.
 * It provides CRUD operations with atomic writes, auto-generated IDs,
 * pagination, and error handling.
 *
 * @example
 * // Inject and use in a service
 * const posts = await this.jsonStorage.findAll<Post>('posts');
 * const post = await this.jsonStorage.create<Post>('posts', postData);
 */
@Injectable()
export class JsonStorageService implements OnModuleInit {
  private readonly logger = new Logger(JsonStorageService.name);
  private dataDir: string;

  constructor(private readonly configService: ConfigService) {
    this.dataDir = this.configService.get<string>('DATA_DIR', './data');
  }

  /**
   * Initialize the service and ensure data directory exists
   */
  async onModuleInit(): Promise<void> {
    await this.ensureDataDirectory();
    this.logger.log(`JsonStorageService initialized with data directory: ${this.dataDir}`);
  }

  /**
   * Ensure the data directory exists
   */
  private async ensureDataDirectory(): Promise<void> {
    const absolutePath = path.resolve(this.dataDir);
    if (!fs.existsSync(absolutePath)) {
      fs.mkdirSync(absolutePath, { recursive: true });
      this.logger.log(`Created data directory: ${absolutePath}`);
    }
  }

  /**
   * Get the absolute file path for a collection
   */
  private getFilePath(collection: string): string {
    return path.resolve(this.dataDir, `${collection}.json`);
  }

  /**
   * Read all data from a collection
   */
  private async readFile<T>(collection: string): Promise<T[]> {
    const filePath = this.getFilePath(collection);

    try {
      if (!fs.existsSync(filePath)) {
        // Create empty file if it doesn't exist
        await this.writeFile(collection, []);
        return [];
      }

      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data) as T[];
    } catch (error) {
      this.logger.error(`Error reading file ${filePath}:`, error);
      throw new Error(`Failed to read data from ${collection}`);
    }
  }

  /**
   * Write data to a collection atomically
   * Uses a temporary file to ensure atomic writes
   */
  private async writeFile<T>(collection: string, data: T[]): Promise<void> {
    const filePath = this.getFilePath(collection);
    const tempPath = `${filePath}.tmp`;

    try {
      // Write to temporary file first
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      // Rename temp file to actual file (atomic operation)
      fs.renameSync(tempPath, filePath);
      this.logger.debug(`Successfully wrote ${data.length} items to ${collection}`);
    } catch (error) {
      // Clean up temp file if it exists
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      this.logger.error(`Error writing file ${filePath}:`, error);
      throw new Error(`Failed to write data to ${collection}`);
    }
  }

  /**
   * Generate a unique ID
   */
  generateId(): string {
    return uuidv4();
  }

  /**
   * Get current timestamp in ISO format
   */
  getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Find all items in a collection with optional pagination
   */
  async findAll<T extends BaseEntity>(
    collection: string,
    options?: PaginationOptions,
  ): Promise<T[] | PaginatedResponse<T>> {
    const data = await this.readFile<T>(collection);

    if (!options) {
      return data;
    }

    const { page, pageSize } = options;
    const total = data.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = data.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      meta: {
        total,
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Find a single item by ID
   */
  async findById<T extends BaseEntity>(
    collection: string,
    id: string,
  ): Promise<T | null> {
    const data = await this.readFile<T>(collection);
    return data.find((item) => item.id === id) || null;
  }

  /**
   * Find items by a specific field value
   */
  async findByField<T extends BaseEntity>(
    collection: string,
    field: keyof T,
    value: unknown,
  ): Promise<T[]> {
    const data = await this.readFile<T>(collection);
    return data.filter((item) => item[field] === value);
  }

  /**
   * Search items by text in specified fields
   */
  async search<T extends BaseEntity>(
    collection: string,
    searchTerm: string,
    fields: (keyof T)[],
    options?: PaginationOptions,
  ): Promise<T[] | PaginatedResponse<T>> {
    const data = await this.readFile<T>(collection);
    const lowerSearchTerm = searchTerm.toLowerCase();

    const filtered = data.filter((item) =>
      fields.some((field) => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(lowerSearchTerm);
        }
        if (Array.isArray(value)) {
          return value.some(
            (v) =>
              typeof v === 'string' &&
              v.toLowerCase().includes(lowerSearchTerm),
          );
        }
        return false;
      }),
    );

    if (!options) {
      return filtered;
    }

    const { page, pageSize } = options;
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filtered.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      meta: {
        total,
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Create a new item in a collection
   */
  async create<T extends BaseEntity>(
    collection: string,
    item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<T> {
    const data = await this.readFile<T>(collection);
    const timestamp = this.getTimestamp();

    const newItem = {
      ...item,
      id: this.generateId(),
      createdAt: timestamp,
      updatedAt: timestamp,
    } as T;

    data.push(newItem);
    await this.writeFile(collection, data);

    this.logger.log(`Created new item in ${collection} with ID: ${newItem.id}`);
    return newItem;
  }

  /**
   * Update an existing item by ID
   */
  async update<T extends BaseEntity>(
    collection: string,
    id: string,
    updates: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<T | null> {
    const data = await this.readFile<T>(collection);
    const index = data.findIndex((item) => item.id === id);

    if (index === -1) {
      return null;
    }

    const updatedItem = {
      ...data[index],
      ...updates,
      updatedAt: this.getTimestamp(),
    } as T;

    data[index] = updatedItem;
    await this.writeFile(collection, data);

    this.logger.log(`Updated item in ${collection} with ID: ${id}`);
    return updatedItem;
  }

  /**
   * Delete an item by ID
   */
  async delete<T extends BaseEntity>(
    collection: string,
    id: string,
  ): Promise<boolean> {
    const data = await this.readFile<T>(collection);
    const index = data.findIndex((item) => item.id === id);

    if (index === -1) {
      return false;
    }

    data.splice(index, 1);
    await this.writeFile(collection, data);

    this.logger.log(`Deleted item from ${collection} with ID: ${id}`);
    return true;
  }

  /**
   * Delete multiple items by a field value
   */
  async deleteByField<T extends BaseEntity>(
    collection: string,
    field: keyof T,
    value: unknown,
  ): Promise<number> {
    const data = await this.readFile<T>(collection);
    const initialLength = data.length;
    const filteredData = data.filter((item) => item[field] !== value);
    const deletedCount = initialLength - filteredData.length;

    if (deletedCount > 0) {
      await this.writeFile(collection, filteredData);
      this.logger.log(
        `Deleted ${deletedCount} items from ${collection} where ${String(field)} = ${value}`,
      );
    }

    return deletedCount;
  }

  /**
   * Check if an item exists by ID
   */
  async exists<T extends BaseEntity>(
    collection: string,
    id: string,
  ): Promise<boolean> {
    const item = await this.findById<T>(collection, id);
    return item !== null;
  }

  /**
   * Count items in a collection
   */
  async count<T extends BaseEntity>(collection: string): Promise<number> {
    const data = await this.readFile<T>(collection);
    return data.length;
  }
}
