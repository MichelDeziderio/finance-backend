import { IsEnum, IsHexColor, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { WalletType } from '../../common/enums/finance.enums';

export class CreateWalletDto {
  @IsString() @IsNotEmpty() @MinLength(2) @MaxLength(40)
  name: string;

  @IsEnum(WalletType)
  type: WalletType;

  @IsHexColor()
  color: string;
}
