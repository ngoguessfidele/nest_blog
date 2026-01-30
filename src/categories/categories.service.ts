import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { JsonStorageService } from '../common/services/json-storage.service';
import { PaginatedResponse } from '../common/interfaces';
import { PaginationQueryDto } from '../common/dto';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { Category } from './entities';

const COLLECTION = 'categories';

/**
 * Service handling all category-related business logic
 */
@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly jsonStorage: JsonStorageService) {}

  /**
   * Create a new category
   *
   * @example
   * const category = await categoriesService.create({
   *   name: 'Technology',
   *   description: 'Tech-related posts'
   * });
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    this.logger.log(`Creating new category: ${createCategoryDto.name}`);

    // Check if category with same name exists
    const existing = await this.findByName(createCategoryDto.name);
    if (existing) {
      throw new ConflictException(
        `Category with name "${createCategoryDto.name}" already exists`,
      );
    }

    const categoryData = {
      ...createCategoryDto,
      description: createCategoryDto.description || '',
    };

    return this.jsonStorage.create<Category>(COLLECTION, categoryData);
  }

  /**
   * Find all categories with optional pagination
   */
  async findAll(
    paginationDto?: PaginationQueryDto,
  ): Promise<Category[] | PaginatedResponse<Category>> {
    this.logger.log('Finding all categories');

    if (!paginationDto || (!paginationDto.page && !paginationDto.pageSize)) {
      return this.jsonStorage.findAll<Category>(COLLECTION) as Promise<Category[]>;
    }

    const { page = 1, pageSize = 10 } = paginationDto;
    return this.jsonStorage.findAll<Category>(COLLECTION, {
      page,
      pageSize,
    }) as Promise<PaginatedResponse<Category>>;
  }

  /**
   * Find a single category by ID
   */
  async findOne(id: string): Promise<Category> {
    this.logger.log(`Finding category with ID: ${id}`);

    const category = await this.jsonStorage.findById<Category>(COLLECTION, id);

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    return category;
  }

  /**
   * Find a category by name
   */
  async findByName(name: string): Promise<Category | null> {
    const categories = (await this.jsonStorage.findAll<Category>(
      COLLECTION,
    )) as Category[];

    return (
      categories.find(
        (cat) => cat.name.toLowerCase() === name.toLowerCase(),
      ) || null
    );
  }

  /**
   * Update an existing category
   */
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    this.logger.log(`Updating category with ID: ${id}`);

    // Check if trying to update name to an existing name
    if (updateCategoryDto.name) {
      const existing = await this.findByName(updateCategoryDto.name);
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Category with name "${updateCategoryDto.name}" already exists`,
        );
      }
    }

    const updatedCategory = await this.jsonStorage.update<Category>(
      COLLECTION,
      id,
      updateCategoryDto,
    );

    if (!updatedCategory) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    return updatedCategory;
  }

  /**
   * Delete a category by ID
   */
  async remove(id: string): Promise<void> {
    this.logger.log(`Deleting category with ID: ${id}`);

    const deleted = await this.jsonStorage.delete<Category>(COLLECTION, id);

    if (!deleted) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }
  }

  /**
   * Search categories by name
   */
  async search(searchTerm: string): Promise<Category[]> {
    return this.jsonStorage.search<Category>(COLLECTION, searchTerm, [
      'name',
      'description',
    ]) as Promise<Category[]>;
  }
}
