import { BaseEntity } from '../../common/interfaces';

/**
 * Comment entity representing a comment on a blog post
 */
export interface Comment extends BaseEntity {
  postId: string;
  author: string;
  content: string;
}
