import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../entities';

/**
 * Response DTO for a single category
 */
export class CategoryResponseDto implements Category {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'Technology' })
  name!: string;

  @ApiProperty({ example: 'Posts about technology and software development' })
  description!: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updatedAt!: string;
}

/**
 * Response DTO for paginated categories list
 */
export class PaginatedCategoriesResponseDto {
  @ApiProperty({ type: [CategoryResponseDto] })
  data!: CategoryResponseDto[];

  @ApiProperty({
    example: {
      total: 50,
      page: 1,
      pageSize: 10,
      totalPages: 5,
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
