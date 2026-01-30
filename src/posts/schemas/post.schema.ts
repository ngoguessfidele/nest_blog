import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PostDocument = HydratedDocument<Post>;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true, minlength: 3, maxlength: 200 })
  title!: string;

  @Prop({ required: true, minlength: 10 })
  content!: string;

  @Prop({ required: true, minlength: 2, maxlength: 100 })
  author!: string;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop()
  image?: string;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  categoryId?: Types.ObjectId;
}

export const PostSchema = SchemaFactory.createForClass(Post);

// Add text index for search
PostSchema.index({ title: 'text', content: 'text', author: 'text' });
