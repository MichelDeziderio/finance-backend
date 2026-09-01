import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';
import { MovementType } from '../../common/enums/finance.enums';

export class CreateMovementDto {
  @IsEnum(MovementType) type: MovementType;
  @IsString() @IsNotEmpty() @MinLength(3) @MaxLength(80) description: string;
  @IsString() @IsNotEmpty() categoryId: string;
  @IsNumber({ maxDecimalPlaces: 2 }) @IsPositive() amount: number;
  @IsDateString() date: string;
  @IsString() @IsNotEmpty() paymentMethod: string;
  @IsOptional() @IsString() @MaxLength(200) notes?: string;
}
