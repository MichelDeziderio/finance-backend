import { IsEnum, IsHexColor, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { MovementType } from '../../common/enums/finance.enums';

export class CreateCategoryDto {
  @IsString() @IsNotEmpty() @MinLength(2) @MaxLength(40)
  name: string;
  @IsEnum(MovementType)
  type: MovementType;
  @IsHexColor()
  color: string;
}
