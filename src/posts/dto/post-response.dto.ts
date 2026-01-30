import { ApiProperty } from '@nestjs/swagger';
import { Post } from '../entities';

/**
 * Response DTO for a single post
 */
export class PostResponseDto implements Post {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'Getting Started with NestJS' })
  title!: string;

  @ApiProperty({ example: 'NestJS is a progressive Node.js framework...' })
  content!: string;

  @ApiProperty({ example: 'John Doe' })
  author!: string;

  @ApiProperty({ example: ['nestjs', 'typescript', 'nodejs'] })
  tags!: string[];

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updatedAt!: string;
}

/**
 * Response DTO for paginated posts list
 */
export class PaginatedPostsResponseDto {
  @ApiProperty({ type: [PostResponseDto] })
  data!: PostResponseDto[];

  @ApiProperty({
    example: {
      total: 100,
      page: 1,
      pageSize: 10,
      totalPages: 10,
      hasNextPage: true,
      hasPreviousPage: false,
    },
  })
  meta!: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
