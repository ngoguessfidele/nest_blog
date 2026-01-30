import { Injectable, Logger, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { JsonStorageService } from '../common/services/json-storage.service';
import { PaginatedResponse } from '../common/interfaces';
import { CreatePostDto, UpdatePostDto, FilterPostsDto } from './dto';
import { Post } from './entities';
import { CommentsService } from '../comments/comments.service';

const COLLECTION = 'posts';

/**
 * Service handling all post-related business logic
 */
@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    private readonly jsonStorage: JsonStorageService,
    @Inject(forwardRef(() => CommentsService))
    private readonly commentsService: CommentsService,
  ) {}

  /**
   * Create a new blog post
   *
   * @example
   * const post = await postsService.create({
   *   title: 'My First Post',
   *   content: 'Hello World!',
   *   author: 'John Doe',
   *   tags: ['intro']
   * });
   */
  async create(createPostDto: CreatePostDto): Promise<Post> {
    this.logger.log(`Creating new post: ${createPostDto.title}`);

    const postData = {
      ...createPostDto,
      tags: createPostDto.tags || [],
    };

    return this.jsonStorage.create<Post>(COLLECTION, postData);
  }

  /**
   * Find all posts with optional filtering and pagination
   */
  async findAll(filterDto: FilterPostsDto): Promise<PaginatedResponse<Post>> {
    const { page = 1, pageSize = 10, search, author, tag, sortBy, sortOrder } = filterDto;

    this.logger.log(`Finding posts - page: ${page}, pageSize: ${pageSize}, search: ${search || 'none'}`);

    // Get all posts first
    let posts = (await this.jsonStorage.findAll<Post>(COLLECTION)) as Post[];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      posts = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchLower) ||
          post.content.toLowerCase().includes(searchLower) ||
          post.author.toLowerCase().includes(searchLower) ||
          post.tags.some((t) => t.toLowerCase().includes(searchLower)),
      );
    }

    // Apply author filter
    if (author) {
      posts = posts.filter((post) =>
        post.author.toLowerCase().includes(author.toLowerCase()),
      );
    }

    // Apply tag filter
    if (tag) {
      posts = posts.filter((post) =>
        post.tags.some((t) => t.toLowerCase() === tag.toLowerCase()),
      );
    }

    // Apply sorting
    if (sortBy) {
      posts.sort((a, b) => {
        const aValue = a[sortBy as keyof Post];
        const bValue = b[sortBy as keyof Post];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortOrder === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        return 0;
      });
    } else {
      // Default sort by createdAt descending
      posts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    // Apply pagination
    const total = posts.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedPosts = posts.slice(startIndex, startIndex + pageSize);

    return {
      data: paginatedPosts,
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
  async findOne(id: string): Promise<Post> {
    this.logger.log(`Finding post with ID: ${id}`);

    const post = await this.jsonStorage.findById<Post>(COLLECTION, id);

    if (!post) {
      throw new NotFoundException(`Post with ID "${id}" not found`);
    }

    return post;
  }

  /**
   * Update an existing post
   */
  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    this.logger.log(`Updating post with ID: ${id}`);

    const updatedPost = await this.jsonStorage.update<Post>(
      COLLECTION,
      id,
      updatePostDto,
    );

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

    const deleted = await this.jsonStorage.delete<Post>(COLLECTION, id);

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
    const posts = (await this.jsonStorage.findAll<Post>(COLLECTION)) as Post[];
    const tagsSet = new Set<string>();

    posts.forEach((post) => {
      post.tags.forEach((tag) => tagsSet.add(tag));
    });

    return Array.from(tagsSet).sort();
  }

  /**
   * Get posts by author
   */
  async findByAuthor(author: string): Promise<Post[]> {
    return this.jsonStorage.findByField<Post>(COLLECTION, 'author', author);
  }
}
