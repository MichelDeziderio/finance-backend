import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'A senha atual é obrigatória.' })
  currentPassword: string;

  @IsString()
  @IsNotEmpty({ message: 'A nova senha é obrigatória.' })
  @MinLength(6, { message: 'A nova senha deve ter no mínimo 6 caracteres.' })
  newPassword: string;
}
