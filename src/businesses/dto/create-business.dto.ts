import {
    IsOptional,
    IsString,
    MaxLength,
    IsUrl,
    IsNumber,
    Min,
    Max,
    IsEmail,
    IsArray,
    ValidateNested,
    IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

class WeeklyScheduleDto {
    @IsString()
    day: string;

    @IsString()
    status: string;

    @IsOptional()
    @IsString()
    openingHour?: string;

    @IsOptional()
    @IsString()
    closingHour?: string;
}

export class CreateBusinessDto {
    @IsString()
    @MaxLength(255)
    name: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    representative?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    slang?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    industry?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    discount?: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    paymentMethods?: string[];

    @IsOptional()
    @IsEmail()
    notificationsEmailAddress?: string;

    @IsOptional()
    @IsOptional()
    @IsIn(['active', 'inactive', 'suspended'], {
        message: 'Status must be one of the following values: active, inactive, or suspended',
    })
    status?: 'active' | 'inactive' | 'suspended'; // Validación para los valores permitidos


    @IsOptional()
    @IsNumber()
    ranking?: number;

    @IsOptional()
    @IsString()
    @IsUrl()
    logo?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => Object)
    images?: {
        image1?: string;
        image2?: string;
        image3?: string;
        image4?: string;
        instagram?: string;
    };

    @IsOptional()
    @IsString()
    @IsUrl()
    googleMapsUrl?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => WeeklyScheduleDto)
    weeklySchedule?: WeeklyScheduleDto[];
}
