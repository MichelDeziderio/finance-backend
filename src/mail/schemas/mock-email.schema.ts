import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'mock_emails', timestamps: true, versionKey: false })
export class MockEmail {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  to: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  html: string;

  @Prop({ required: true, unique: true })
  tokenHash: string;

  @Prop({ required: true })
  expiresAt: Date;
}

export type MockEmailDocument = HydratedDocument<MockEmail>;
export const MockEmailSchema = SchemaFactory.createForClass(MockEmail);
MockEmailSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
