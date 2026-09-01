import { IsEnum, IsOptional } from 'class-validator';
import { MovementType } from '../../common/enums/finance.enums';
export class ListCategoriesQueryDto {
  @IsOptional() @IsEnum(MovementType)
  type?: MovementType;
}
