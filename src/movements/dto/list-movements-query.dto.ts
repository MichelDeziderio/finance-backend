import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { MovementType } from '../../common/enums/finance.enums';
export class ListMovementsQueryDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsEnum(MovementType) type?: MovementType;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 10;
  @IsOptional() @IsIn(['date', 'amount', 'description']) sortBy: 'date' | 'amount' | 'description' = 'date';
  @IsOptional() @IsIn(['asc', 'desc']) sortOrder: 'asc' | 'desc' = 'desc';
}
