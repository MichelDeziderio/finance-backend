import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { MovementType } from '../../common/enums/finance.enums';

@Schema({ timestamps: true, versionKey: false })
export class Category {
  @Prop({ required: true, unique: true, index: true }) id: string;
  @Prop({ required: true, index: true }) walletId: string;
  @Prop({ required: true, trim: true, minlength: 2, maxlength: 40 }) name: string;
  @Prop({ required: true, enum: MovementType, index: true }) type: MovementType;
  @Prop({ required: true, match: /^#[0-9A-Fa-f]{6}$/ }) color: string;
  @Prop({ required: true, default: false }) isDefault: boolean;
  @Prop({ type: String, default: null }) defaultKey?: string | null;
}
export type CategoryDocument = HydratedDocument<Category>;
export const CategorySchema = SchemaFactory.createForClass(Category);
type CategorySerialized = Category & { _id?: Types.ObjectId };

CategorySchema.index({ walletId: 1, type: 1, name: 1 }, { unique: true, collation: { locale: 'pt', strength: 2 } });
CategorySchema.set('toJSON', {
  transform: (_doc, ret: CategorySerialized) => {
    const { _id, ...rest } = ret;
    return rest;
  },
});
