import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Já existe um usuário cadastrado com este e-mail.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    });

    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    let passwordMatches = false;
    try {
      passwordMatches = await bcrypt.compare(dto.password, user.password);
    } catch {
      passwordMatches = false;
    }

    // Se a senha foi inserida manualmente no banco em texto puro, aceita e atualiza para hash bcrypt
    if (!passwordMatches && user.password === dto.password) {
      passwordMatches = true;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(dto.password, salt);
      await this.usersService.update(user.id, { password: hashedPassword });
    }

    if (!passwordMatches) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      // Por segurança, para evitar enumeração de e-mails, retornamos mensagem de sucesso mesmo se não existir
      return {
        message: 'Se o e-mail estiver cadastrado, as instruções de recuperação foram enviadas.',
      };
    }

    // Gera token seguro e define validade de 1 hora
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await this.usersService.update(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires,
    });

    // Envia o e-mail estilizado via SMTP do Gmail
    await this.mailService.sendPasswordResetEmail(user.email, user.name, resetToken);

    return {
      message: 'Se o e-mail estiver cadastrado, as instruções de recuperação foram enviadas.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findByResetToken(dto.token);
    if (!user) {
      throw new BadRequestException('O link de recuperação é inválido ou já expirou.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.newPassword, salt);

    await this.usersService.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    // Envia e-mail de aviso de que a senha foi alterada
    await this.mailService.sendPasswordChangedConfirmation(user.email, user.name);

    return {
      message: 'Senha alterada com sucesso! Você já pode realizar o login com a nova senha.',
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const passwordMatches = await bcrypt.compare(dto.currentPassword, user.password);
    if (!passwordMatches) {
      throw new BadRequestException('A senha atual informada está incorreta.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.newPassword, salt);

    await this.usersService.update(user.id, { password: hashedPassword });

    await this.mailService.sendPasswordChangedConfirmation(user.email, user.name);

    return {
      message: 'Senha alterada com sucesso!',
    };
  }

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  private generateToken(userId: string, email: string): string {
    return this.jwtService.sign(
      { sub: userId, email },
      {
        expiresIn: '7d',
      },
    );
  }
}
