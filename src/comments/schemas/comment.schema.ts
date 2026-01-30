import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'Post', required: true, index: true })
  postId!: Types.ObjectId;

  @Prop({ required: true, minlength: 2, maxlength: 100 })
  author!: string;

  @Prop({ required: true, minlength: 1 })
  content!: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
