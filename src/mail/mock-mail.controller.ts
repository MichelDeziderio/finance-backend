import {
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Param,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

@Controller('dev/mock-emails')
export class MockMailController {
  constructor(
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  private authorize(secret?: string): void {
    if (!this.mail.isMockEnabled()) {
      throw new ServiceUnavailableException('Caixa simulada desativada');
    }
    // A credencial é APENAS do servidor / Postman; nunca embutir em Angular.
    this.mail.assertMockInboxAccess(secret);
  }

  @Get()
  list(@Headers('x-mock-inbox-key') secret?: string) {
    this.authorize(secret);
    return this.mail.listMockEmails();
  }

  @Get(':id')
  detail(@Param('id') id: string, @Headers('x-mock-inbox-key') secret?: string) {
    this.authorize(secret);
    return this.mail.getMockEmail(id);
  }
}
