import { BaseEntity } from '../../common/interfaces';

/**
 * Category entity representing a blog category
 */
export interface Category extends BaseEntity {
  name: string;
  description: string;
}
