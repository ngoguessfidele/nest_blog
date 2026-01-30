import { ApiProperty } from '@nestjs/swagger';
import { Comment } from '../entities';

/**
 * Response DTO for a single comment
 */
export class CommentResponseDto implements Comment {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  postId!: string;

  @ApiProperty({ example: 'Jane Doe' })
  author!: string;

  @ApiProperty({ example: 'Great article! Very helpful.' })
  content!: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updatedAt!: string;
}

/**
 * Response DTO for paginated comments list
 */
export class PaginatedCommentsResponseDto {
  @ApiProperty({ type: [CommentResponseDto] })
  data!: CommentResponseDto[];

  @ApiProperty({
    example: {
      total: 25,
      page: 1,
      pageSize: 10,
      totalPages: 3,
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
