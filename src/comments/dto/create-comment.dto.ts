import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

/**
 * DTO for creating a new comment
 *
 * @example
 * POST /posts/:postId/comments
 * {
 *   "author": "Jane Doe",
 *   "content": "Great article! Very helpful."
 * }
 */
export class CreateCommentDto {
  @ApiProperty({
    description: 'The author of the comment',
    example: 'Jane Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  author!: string;

  @ApiProperty({
    description: 'The content of the comment',
    example: 'Great article! Very helpful for understanding NestJS.',
    minLength: 1,
    maxLength: 2000,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content!: string;
}

/**
 * Internal DTO that includes postId (set by controller)
 */
export class CreateCommentInternalDto extends CreateCommentDto {
  @ApiProperty({
    description: 'The ID of the post this comment belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  postId!: string;
}
