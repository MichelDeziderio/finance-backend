import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { MovementType } from '../../common/enums/finance.enums';

@Schema({ timestamps: true, versionKey: false })
export class Movement {
  @Prop({ required: true, unique: true, index: true }) id: string;
  @Prop({ required: true, index: true }) walletId: string;
  @Prop({ required: true, enum: MovementType, index: true }) type: MovementType;
  @Prop({ required: true, trim: true, minlength: 3, maxlength: 80, index: true }) description: string;
  @Prop({ required: true, index: true }) categoryId: string;
  @Prop({ required: true, min: 0.01 }) amount: number;
  @Prop({ required: true, index: true }) date: Date;
  @Prop({ required: true, trim: true }) paymentMethod: string;
  @Prop({ trim: true, maxlength: 200 }) notes?: string;
}
export type MovementDocument = HydratedDocument<Movement>;
export const MovementSchema = SchemaFactory.createForClass(Movement);
type MovementSerialized = Omit<Movement, 'notes'> & {
  _id?: Types.ObjectId;
  date: Date | string;
  notes?: string;
};

MovementSchema.index({ walletId: 1, date: -1 });
MovementSchema.index({ walletId: 1, type: 1, categoryId: 1, date: -1 });
MovementSchema.set('toJSON', {
  transform: (_doc, ret: MovementSerialized) => {
    const { _id, ...rest } = ret;
    if (rest.date instanceof Date) {
      return { ...rest, date: rest.date.toISOString().slice(0, 10) };
    }
    return rest;
  },
});
