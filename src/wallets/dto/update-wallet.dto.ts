import { IsEnum, IsHexColor, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { WalletType } from '../../common/enums/finance.enums';

export class UpdateWalletDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(40)
  name?: string;
  @IsOptional() @IsEnum(WalletType)
  type?: WalletType;
  @IsOptional() @IsHexColor()
  color?: string;
}
