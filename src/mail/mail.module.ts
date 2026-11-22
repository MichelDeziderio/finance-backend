import { MongooseModule } from '@nestjs/mongoose';
import { MockEmail, MockEmailSchema } from './schemas/mock-email.schema';
import { MockMailController } from './mock-mail.controller';
import { MockInboxPageController } from './mock-inbox-page.controller';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: MockEmail.name, schema: MockEmailSchema }])],
  controllers: [MockMailController, MockInboxPageController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
