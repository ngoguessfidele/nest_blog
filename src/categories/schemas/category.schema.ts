import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, unique: true, minlength: 2, maxlength: 100 })
  name!: string;

  @Prop({ maxlength: 500 })
  description?: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
