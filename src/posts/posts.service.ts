import { Injectable, Logger, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import { Post, PostDocument } from './schemas';
import { CreatePostDto, UpdatePostDto, FilterPostsDto } from './dto';
import { PaginatedResponse } from '../common/interfaces';
import { CommentsService } from '../comments/comments.service';

/**
 * Service handling all post-related business logic
 */
@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @Inject(forwardRef(() => CommentsService))
    private readonly commentsService: CommentsService,
  ) {}

  /**
   * Create a new blog post
   */
  async create(createPostDto: CreatePostDto) {
    this.logger.log(`Creating new post: ${createPostDto.title}`);

    const postData = {
      ...createPostDto,
      tags: createPostDto.tags || [],
    };

    const createdPost = new this.postModel(postData);
    return createdPost.save();
  }

  /**
   * Find all posts with optional filtering and pagination
   */
  async findAll(filterDto: FilterPostsDto): Promise<PaginatedResponse<PostDocument>> {
    const { page = 1, pageSize = 10, search, author, tag, sortBy, sortOrder = 'desc' } = filterDto;

    this.logger.log(`Finding posts - page: ${page}, pageSize: ${pageSize}, search: ${search || 'none'}`);

    // Build filter query
    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    if (author) {
      filter.author = { $regex: author, $options: 'i' };
    }

    if (tag) {
      filter.tags = { $regex: new RegExp(`^${tag}$`, 'i') };
    }

    // Build sort options
    const sortOptions: { [key: string]: SortOrder } = {};
    if (sortBy) {
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortOptions['createdAt'] = -1; // Default sort by createdAt descending
    }

    // Get total count
    const total = await this.postModel.countDocuments(filter);

    // Get paginated results
    const skip = (page - 1) * pageSize;
    const posts = await this.postModel
      .find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize)
      .exec();

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: posts,
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
   * Find a single post by ID
   */
  async findOne(id: string) {
    this.logger.log(`Finding post with ID: ${id}`);

    const post = await this.postModel.findById(id).exec();

    if (!post) {
      throw new NotFoundException(`Post with ID "${id}" not found`);
    }

    return post;
  }

  /**
   * Update an existing post
   */
  async update(id: string, updatePostDto: UpdatePostDto) {
    this.logger.log(`Updating post with ID: ${id}`);

    const updatedPost = await this.postModel
      .findByIdAndUpdate(id, updatePostDto, { new: true })
      .exec();

    if (!updatedPost) {
      throw new NotFoundException(`Post with ID "${id}" not found`);
    }

    return updatedPost;
  }

  /**
   * Delete a post by ID and all associated comments
   */
  async remove(id: string): Promise<void> {
    this.logger.log(`Deleting post with ID: ${id}`);

    const deleted = await this.postModel.findByIdAndDelete(id).exec();

    if (!deleted) {
      throw new NotFoundException(`Post with ID "${id}" not found`);
    }

    // Cascade delete: remove all comments associated with this post
    const deletedCommentsCount = await this.commentsService.removeByPostId(id);
    this.logger.log(`Deleted ${deletedCommentsCount} comments for post: ${id}`);
  }

  /**
   * Get all unique tags from posts
   */
  async getAllTags(): Promise<string[]> {
    const result = await this.postModel.distinct('tags').exec();
    return result.sort();
  }

  /**
   * Get posts by author
   */
  async findByAuthor(author: string) {
    return this.postModel.find({ author: { $regex: author, $options: 'i' } }).exec();
  }
}
