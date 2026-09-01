import { IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';
import { MovementType } from '../../common/enums/finance.enums';
export class UpdateMovementDto {
  @IsOptional() @IsEnum(MovementType) type?: MovementType;
  @IsOptional() @IsString() @MinLength(3) @MaxLength(80) description?: string;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @IsPositive() amount?: number;
  @IsOptional() @IsDateString() date?: string;
  @IsOptional() @IsString() paymentMethod?: string;
  @IsOptional() @IsString() @MaxLength(200) notes?: string;
}
