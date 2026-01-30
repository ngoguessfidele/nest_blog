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
import { PostsService } from './posts.service';
import {
  CreatePostDto,
  UpdatePostDto,
  FilterPostsDto,
  PostResponseDto,
  PaginatedPostsResponseDto,
} from './dto';

/**
 * Controller handling all post-related HTTP endpoints
 *
 * @example
 * // Create a new post
 * POST /api/posts
 * {
 *   "title": "My Post",
 *   "content": "Content here...",
 *   "author": "John Doe",
 *   "tags": ["tech", "nestjs"]
 * }
 *
 * // Get all posts with pagination
 * GET /api/posts?page=1&pageSize=10&search=nestjs
 *
 * // Get single post
 * GET /api/posts/:id
 *
 * // Update post
 * PATCH /api/posts/:id
 * { "title": "Updated Title" }
 *
 * // Delete post
 * DELETE /api/posts/:id
 */
@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  private readonly logger = new Logger(PostsController.name);

  constructor(private readonly postsService: PostsService) {}

  /**
   * Create a new blog post
   */
  @Post()
  @ApiOperation({ summary: 'Create a new blog post' })
  @ApiResponse({
    status: 201,
    description: 'The post has been successfully created.',
    type: PostResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data.' })
  async create(@Body() createPostDto: CreatePostDto): Promise<PostResponseDto> {
    this.logger.log(`POST /posts - Creating new post: ${createPostDto.title}`);
    return this.postsService.create(createPostDto);
  }

  /**
   * Get all posts with pagination and filtering
   */
  @Get()
  @ApiOperation({ summary: 'Get all posts with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'author', required: false, type: String, description: 'Filter by author' })
  @ApiQuery({ name: 'tag', required: false, type: String, description: 'Filter by tag' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  @ApiResponse({
    status: 200,
    description: 'List of posts with pagination metadata.',
    type: PaginatedPostsResponseDto,
  })
  async findAll(@Query() filterDto: FilterPostsDto): Promise<PaginatedPostsResponseDto> {
    this.logger.log(`GET /posts - Fetching posts with filters: ${JSON.stringify(filterDto)}`);
    return this.postsService.findAll(filterDto);
  }

  /**
   * Get all unique tags
   */
  @Get('tags')
  @ApiOperation({ summary: 'Get all unique tags from posts' })
  @ApiResponse({
    status: 200,
    description: 'List of unique tags.',
    type: [String],
  })
  async getAllTags(): Promise<string[]> {
    this.logger.log('GET /posts/tags - Fetching all tags');
    return this.postsService.getAllTags();
  }

  /**
   * Get a single post by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a single post by ID' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({
    status: 200,
    description: 'The found post.',
    type: PostResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  async findOne(@Param('id') id: string): Promise<PostResponseDto> {
    this.logger.log(`GET /posts/${id} - Fetching post`);
    return this.postsService.findOne(id);
  }

  /**
   * Update a post by ID
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update a post by ID' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({
    status: 200,
    description: 'The post has been successfully updated.',
    type: PostResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<PostResponseDto> {
    this.logger.log(`PATCH /posts/${id} - Updating post`);
    return this.postsService.update(id, updatePostDto);
  }

  /**
   * Delete a post by ID
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a post by ID' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({
    status: 204,
    description: 'The post has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    this.logger.log(`DELETE /posts/${id} - Deleting post`);
    return this.postsService.remove(id);
  }
}
