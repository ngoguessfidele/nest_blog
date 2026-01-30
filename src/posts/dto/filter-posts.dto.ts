import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { SearchQueryDto } from '../../common/dto';

/**
 * DTO for filtering and searching posts
 *
 * @example
 * GET /posts?search=nestjs&author=John&tag=typescript&page=1&pageSize=10
 */
export class FilterPostsDto extends SearchQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by author name',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({
    description: 'Filter by tag',
    example: 'typescript',
  })
  @IsOptional()
  @IsString()
  tag?: string;
}
