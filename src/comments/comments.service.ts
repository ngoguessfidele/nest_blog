import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schemas';
import { PaginatedResponse } from '../common/interfaces';
import { PaginationQueryDto } from '../common/dto';
import { CreateCommentInternalDto } from './dto';

/**
 * Service handling all comment-related business logic
 */
@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  /**
   * Create a new comment for a post
   */
  async create(createCommentDto: CreateCommentInternalDto) {
    this.logger.log(
      `Creating new comment for post: ${createCommentDto.postId}`,
    );

    const commentData = {
      ...createCommentDto,
      postId: new Types.ObjectId(createCommentDto.postId),
    };

    const createdComment = new this.commentModel(commentData);
    return createdComment.save();
  }

  /**
   * Find all comments for a specific post with optional pagination
   */
  async findByPostId(
    postId: string,
    paginationDto?: PaginationQueryDto,
  ) {
    this.logger.log(`Finding comments for post: ${postId}`);

    const filter = { postId: new Types.ObjectId(postId) };

    if (!paginationDto || (!paginationDto.page && !paginationDto.pageSize)) {
      return this.commentModel
        .find(filter)
        .sort({ createdAt: -1 })
        .exec();
    }

    const { page = 1, pageSize = 10 } = paginationDto;
    const total = await this.commentModel.countDocuments(filter);
    const skip = (page - 1) * pageSize;

    const comments = await this.commentModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .exec();

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: comments,
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
  async findOne(id: string) {
    this.logger.log(`Finding comment with ID: ${id}`);

    const comment = await this.commentModel.findById(id).exec();

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

    const deleted = await this.commentModel.findByIdAndDelete(id).exec();

    if (!deleted) {
      throw new NotFoundException(`Comment with ID "${id}" not found`);
    }
  }

  /**
   * Delete all comments for a specific post
   */
  async removeByPostId(postId: string): Promise<number> {
    this.logger.log(`Deleting all comments for post: ${postId}`);

    const result = await this.commentModel
      .deleteMany({ postId: new Types.ObjectId(postId) })
      .exec();

    return result.deletedCount || 0;
  }

  /**
   * Count comments for a specific post
   */
  async countByPostId(postId: string): Promise<number> {
    return this.commentModel
      .countDocuments({ postId: new Types.ObjectId(postId) })
      .exec();
  }
}
