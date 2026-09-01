import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { WalletType } from '../../common/enums/finance.enums';

@Schema({ timestamps: true, versionKey: false })
export class Wallet {
  @Prop({ required: true, unique: true, index: true }) id: string;
  @Prop({ required: true, trim: true, minlength: 2, maxlength: 40 }) name: string;
  @Prop({ required: true, enum: WalletType }) type: WalletType;
  @Prop({ required: true, match: /^#[0-9A-Fa-f]{6}$/ }) color: string;
}
export type WalletDocument = HydratedDocument<Wallet>;
export const WalletSchema = SchemaFactory.createForClass(Wallet);
type WalletSerialized = Wallet & { _id?: Types.ObjectId };

WalletSchema.set('toJSON', {
  transform: (_doc, ret: WalletSerialized) => {
    const { _id, ...rest } = ret;
    return rest;
  },
});
