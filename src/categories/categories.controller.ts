import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/dto';
import { PaginatedResponse } from '../common/interfaces';
import { CategoriesService } from './categories.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryResponseDto,
  PaginatedCategoriesResponseDto,
} from './dto';
import { Category } from './entities';

/**
 * Controller handling all category-related HTTP endpoints
 *
 * @example
 * // Create a new category
 * POST /api/categories
 * {
 *   "name": "Technology",
 *   "description": "Tech-related posts"
 * }
 *
 * // Get all categories
 * GET /api/categories
 *
 * // Get single category
 * GET /api/categories/:id
 *
 * // Update category
 * PATCH /api/categories/:id
 * { "name": "Updated Name" }
 *
 * // Delete category
 * DELETE /api/categories/:id
 */
@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  private readonly logger = new Logger(CategoriesController.name);

  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Create a new category
   */
  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'The category has been successfully created.',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data.' })
  @ApiResponse({ status: 409, description: 'Conflict - Category name already exists.' })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    this.logger.log(`POST /categories - Creating new category: ${createCategoryDto.name}`);
    return this.categoriesService.create(createCategoryDto);
  }

  /**
   * Get all categories with optional pagination
   */
  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'List of categories.',
    type: PaginatedCategoriesResponseDto,
  })
  async findAll(
    @Query() paginationDto: PaginationQueryDto,
  ): Promise<Category[] | PaginatedResponse<Category>> {
    this.logger.log(`GET /categories - Fetching categories`);
    return this.categoriesService.findAll(paginationDto);
  }

  /**
   * Search categories by name
   */
  @Get('search')
  @ApiOperation({ summary: 'Search categories by name or description' })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Search term' })
  @ApiResponse({
    status: 200,
    description: 'List of matching categories.',
    type: [CategoryResponseDto],
  })
  async search(@Query('q') searchTerm: string): Promise<Category[]> {
    this.logger.log(`GET /categories/search - Searching for: ${searchTerm}`);
    return this.categoriesService.search(searchTerm || '');
  }

  /**
   * Get a single category by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a single category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'The found category.',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  async findOne(@Param('id') id: string): Promise<CategoryResponseDto> {
    this.logger.log(`GET /categories/${id} - Fetching category`);
    return this.categoriesService.findOne(id);
  }

  /**
   * Update a category by ID
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update a category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'The category has been successfully updated.',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  @ApiResponse({ status: 409, description: 'Conflict - Category name already exists.' })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    this.logger.log(`PATCH /categories/${id} - Updating category`);
    return this.categoriesService.update(id, updateCategoryDto);
  }

  /**
   * Delete a category by ID
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: 204,
    description: 'The category has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    this.logger.log(`DELETE /categories/${id} - Deleting category`);
    return this.categoriesService.remove(id);
  }
}
