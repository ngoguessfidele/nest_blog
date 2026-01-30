import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas';
import { PaginatedResponse } from '../common/interfaces';
import { PaginationQueryDto } from '../common/dto';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

/**
 * Service handling all category-related business logic
 */
@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  /**
   * Create a new category
   */
  async create(createCategoryDto: CreateCategoryDto) {
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

    const createdCategory = new this.categoryModel(categoryData);
    return createdCategory.save();
  }

  /**
   * Find all categories with optional pagination
   */
  async findAll(
    paginationDto?: PaginationQueryDto,
  ) {
    this.logger.log('Finding all categories');

    if (!paginationDto || (!paginationDto.page && !paginationDto.pageSize)) {
      return this.categoryModel.find().sort({ name: 1 }).exec();
    }

    const { page = 1, pageSize = 10 } = paginationDto;
    const total = await this.categoryModel.countDocuments();
    const skip = (page - 1) * pageSize;

    const categories = await this.categoryModel
      .find()
      .sort({ name: 1 })
      .skip(skip)
      .limit(pageSize)
      .exec();

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: categories,
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
   * Find a single category by ID
   */
  async findOne(id: string) {
    this.logger.log(`Finding category with ID: ${id}`);

    const category = await this.categoryModel.findById(id).exec();

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    return category;
  }

  /**
   * Find a category by name
   */
  async findByName(name: string) {
    return this.categoryModel
      .findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } })
      .exec();
  }

  /**
   * Update an existing category
   */
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ) {
    this.logger.log(`Updating category with ID: ${id}`);

    // Check if trying to update name to an existing name
    if (updateCategoryDto.name) {
      const existing = await this.findByName(updateCategoryDto.name);
      if (existing && existing._id.toString() !== id) {
        throw new ConflictException(
          `Category with name "${updateCategoryDto.name}" already exists`,
        );
      }
    }

    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();

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

    const deleted = await this.categoryModel.findByIdAndDelete(id).exec();

    if (!deleted) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }
  }

  /**
   * Search categories by name
   */
  async search(searchTerm: string) {
    return this.categoryModel
      .find({
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
        ],
      })
      .exec();
  }
}
