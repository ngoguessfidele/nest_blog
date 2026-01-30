import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CreatePostDto } from './create-post.dto';

/**
 * DTO for updating an existing blog post
 * All fields are optional
 *
 * @example
 * PATCH /posts/:id
 * {
 *   "title": "Updated Title",
 *   "tags": ["updated", "tags"]
 * }
 */
export class UpdatePostDto extends PartialType(CreatePostDto) {
  @ApiPropertyOptional({
    description: 'The title of the blog post',
    example: 'Updated: Getting Started with NestJS',
    minLength: 3,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description: 'The main content of the blog post',
    example: 'Updated content...',
    minLength: 10,
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  content?: string;

  @ApiPropertyOptional({
    description: 'The author of the blog post',
    example: 'Jane Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  author?: string;

  @ApiPropertyOptional({
    description: 'Tags associated with the post',
    example: ['updated', 'tags'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
