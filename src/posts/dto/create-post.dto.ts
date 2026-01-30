import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * DTO for creating a new blog post
 *
 * @example
 * POST /posts
 * {
 *   "title": "Getting Started with NestJS",
 *   "content": "NestJS is a progressive Node.js framework...",
 *   "author": "John Doe",
 *   "tags": ["nestjs", "typescript", "nodejs"]
 * }
 */
export class CreatePostDto {
  @ApiProperty({
    description: 'The title of the blog post',
    example: 'Getting Started with NestJS',
    minLength: 3,
    maxLength: 200,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @ApiProperty({
    description: 'The main content of the blog post',
    example: 'NestJS is a progressive Node.js framework for building efficient and scalable server-side applications...',
    minLength: 10,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  content!: string;

  @ApiProperty({
    description: 'The author of the blog post',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  author!: string;

  @ApiPropertyOptional({
    description: 'Tags associated with the post',
    example: ['nestjs', 'typescript', 'nodejs'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'URL of the featured image for the post',
    example: 'https://example.com/images/nestjs-tutorial.jpg',
  })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'image must be a valid URL' })
  image?: string;

  @ApiPropertyOptional({
    description: 'The ID of the category this post belongs to',
    example: 'cat-001-tech-abcd-efgh12345678',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;
}
