import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
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
import { PostsService } from '../posts/posts.service';
import { CommentsService } from './comments.service';
import {
  CreateCommentDto,
  CommentResponseDto,
  PaginatedCommentsResponseDto,
} from './dto';
import { Comment } from './entities';

/**
 * Controller handling comment-related HTTP endpoints
 * Comments are nested under posts (/posts/:postId/comments)
 *
 * @example
 * // Add a comment to a post
 * POST /api/posts/:postId/comments
 * {
 *   "author": "Jane Doe",
 *   "content": "Great post!"
 * }
 *
 * // Get all comments for a post
 * GET /api/posts/:postId/comments?page=1&pageSize=10
 *
 * // Delete a comment
 * DELETE /api/comments/:id
 */
@ApiTags('Comments')
@Controller()
export class CommentsController {
  private readonly logger = new Logger(CommentsController.name);

  constructor(
    private readonly commentsService: CommentsService,
    private readonly postsService: PostsService,
  ) {}

  /**
   * Add a comment to a post
   */
  @Post('posts/:postId/comments')
  @ApiOperation({ summary: 'Add a comment to a post' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiResponse({
    status: 201,
    description: 'The comment has been successfully created.',
    type: CommentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  async create(
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    this.logger.log(`POST /posts/${postId}/comments - Creating new comment`);

    // Verify post exists
    try {
      await this.postsService.findOne(postId);
    } catch {
      throw new NotFoundException(`Post with ID "${postId}" not found`);
    }

    return this.commentsService.create({
      ...createCommentDto,
      postId,
    });
  }

  /**
   * Get all comments for a post
   */
  @Get('posts/:postId/comments')
  @ApiOperation({ summary: 'Get all comments for a post' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'List of comments for the post.',
    type: PaginatedCommentsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  async findByPost(
    @Param('postId') postId: string,
    @Query() paginationDto: PaginationQueryDto,
  ): Promise<Comment[] | PaginatedResponse<Comment>> {
    this.logger.log(`GET /posts/${postId}/comments - Fetching comments`);

    // Verify post exists
    try {
      await this.postsService.findOne(postId);
    } catch {
      throw new NotFoundException(`Post with ID "${postId}" not found`);
    }

    return this.commentsService.findByPostId(postId, paginationDto);
  }

  /**
   * Get comment count for a post
   */
  @Get('posts/:postId/comments/count')
  @ApiOperation({ summary: 'Get comment count for a post' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiResponse({
    status: 200,
    description: 'The comment count.',
    schema: {
      type: 'object',
      properties: {
        postId: { type: 'string' },
        count: { type: 'number' },
      },
    },
  })
  async getCount(
    @Param('postId') postId: string,
  ): Promise<{ postId: string; count: number }> {
    this.logger.log(`GET /posts/${postId}/comments/count - Getting comment count`);

    const count = await this.commentsService.countByPostId(postId);
    return { postId, count };
  }

  /**
   * Get a single comment by ID
   */
  @Get('comments/:id')
  @ApiOperation({ summary: 'Get a single comment by ID' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({
    status: 200,
    description: 'The found comment.',
    type: CommentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Comment not found.' })
  async findOne(@Param('id') id: string): Promise<CommentResponseDto> {
    this.logger.log(`GET /comments/${id} - Fetching comment`);
    return this.commentsService.findOne(id);
  }

  /**
   * Delete a comment by ID
   */
  @Delete('comments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a comment by ID' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({
    status: 204,
    description: 'The comment has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Comment not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    this.logger.log(`DELETE /comments/${id} - Deleting comment`);
    return this.commentsService.remove(id);
  }
}
