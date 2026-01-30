import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { JsonStorageService } from '../common/services/json-storage.service';
import { PaginatedResponse } from '../common/interfaces';
import { PaginationQueryDto } from '../common/dto';
import { CreateCommentInternalDto } from './dto';
import { Comment } from './entities';

const COLLECTION = 'comments';

/**
 * Service handling all comment-related business logic
 */
@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(private readonly jsonStorage: JsonStorageService) {}

  /**
   * Create a new comment for a post
   *
   * @example
   * const comment = await commentsService.create({
   *   postId: '123',
   *   author: 'Jane Doe',
   *   content: 'Great post!'
   * });
   */
  async create(createCommentDto: CreateCommentInternalDto): Promise<Comment> {
    this.logger.log(
      `Creating new comment for post: ${createCommentDto.postId}`,
    );

    return this.jsonStorage.create<Comment>(COLLECTION, createCommentDto);
  }

  /**
   * Find all comments for a specific post with optional pagination
   */
  async findByPostId(
    postId: string,
    paginationDto?: PaginationQueryDto,
  ): Promise<Comment[] | PaginatedResponse<Comment>> {
    this.logger.log(`Finding comments for post: ${postId}`);

    // Get all comments for this post
    let comments = await this.jsonStorage.findByField<Comment>(
      COLLECTION,
      'postId',
      postId,
    );

    // Sort by createdAt descending (newest first)
    comments.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    if (!paginationDto || (!paginationDto.page && !paginationDto.pageSize)) {
      return comments;
    }

    const { page = 1, pageSize = 10 } = paginationDto;
    const total = comments.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedComments = comments.slice(startIndex, startIndex + pageSize);

    return {
      data: paginatedComments,
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
   * Find a single comment by ID
   */
  async findOne(id: string): Promise<Comment> {
    this.logger.log(`Finding comment with ID: ${id}`);

    const comment = await this.jsonStorage.findById<Comment>(COLLECTION, id);

    if (!comment) {
      throw new NotFoundException(`Comment with ID "${id}" not found`);
    }

    return comment;
  }

  /**
   * Delete a comment by ID
   */
  async remove(id: string): Promise<void> {
    this.logger.log(`Deleting comment with ID: ${id}`);

    const deleted = await this.jsonStorage.delete<Comment>(COLLECTION, id);

    if (!deleted) {
      throw new NotFoundException(`Comment with ID "${id}" not found`);
    }
  }

  /**
   * Delete all comments for a specific post
   */
  async removeByPostId(postId: string): Promise<number> {
    this.logger.log(`Deleting all comments for post: ${postId}`);

    return this.jsonStorage.deleteByField<Comment>(COLLECTION, 'postId', postId);
  }

  /**
   * Count comments for a specific post
   */
  async countByPostId(postId: string): Promise<number> {
    const comments = await this.jsonStorage.findByField<Comment>(
      COLLECTION,
      'postId',
      postId,
    );
    return comments.length;
  }
}
