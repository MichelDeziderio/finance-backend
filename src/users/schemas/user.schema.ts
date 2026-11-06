import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class User {
  @Prop({ required: true, unique: true, index: true })
  id: string;

  @Prop({ required: true, trim: true, minlength: 2, maxlength: 100 })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String, default: null })
  resetPasswordToken?: string | null;

  @Prop({ type: Date, default: null })
  resetPasswordExpires?: Date | null;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);

type UserSerialized = User & { _id?: Types.ObjectId };

UserSchema.set('toJSON', {
  transform: (_doc, ret: UserSerialized) => {
    const { _id, password, resetPasswordToken, resetPasswordExpires, ...rest } = ret as any;
    return rest;
  },
});
