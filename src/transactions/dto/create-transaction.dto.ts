import { IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransactionDto {
    @IsNumber()
    @Type(() => Number)
    userId: number;

    @IsNumber()
    @Type(() => Number)
    businessId: number;

    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    initAmount: number;

    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    finalAmount: number;

    @IsNumber()
    @Type(() => Number)
    discountPercentage: number;
}
