import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, IsUrl, IsNumber, Min, Max, IsEmail } from 'class-validator';

export class FastCreateBusinessDto {
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

    @Transform(({ value }) => parseFloat(value)) // Convierte a número
    @IsNumber()
    @Min(0)
    @Max(100)
    @IsOptional()
    discount?: number;

    @IsOptional()
    @IsString({ each: true })
    paymentMethods?: string[];

    @IsOptional()
    @IsEmail()
    notificationsEmailAddress?: string;

    // Logo como URL individual
    @IsOptional()
    @IsString()
    @IsUrl()
    logo?: string;

    // Imágenes como URLs individuales
    @IsOptional()
    @IsString()
    @IsUrl()
    image1?: string;

    @IsOptional()
    @IsString()
    @IsUrl()
    image2?: string;

    @IsOptional()
    @IsString()
    @IsUrl()
    image3?: string;

    @IsOptional()
    @IsString()
    @IsUrl()
    image4?: string;

    @IsOptional()
    @IsString()
    @IsUrl()
    image5?: string;
}
