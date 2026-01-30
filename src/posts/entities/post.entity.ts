import { BaseEntity } from '../../common/interfaces';

/**
 * Post entity representing a blog post
 */
export interface Post extends BaseEntity {
  title: string;
  content: string;
  author: string;
  tags: string[];
  image?: string;
  categoryId?: string;
}
