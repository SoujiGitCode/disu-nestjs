import { Transform } from 'class-transformer';
import {
    IsString,
    IsOptional,
    IsEmail,
    IsNumber,
    IsBase64,
    MaxLength,
    Min,
    Max,
} from 'class-validator';

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

    @IsOptional()
    @IsBase64()
    logo?: string; // Logo en formato base64

    // Imágenes individuales (5 campos opcionales)
    @IsOptional()
    @IsBase64()
    image1?: string;

    @IsOptional()
    @IsBase64()
    image2?: string;

    @IsOptional()
    @IsBase64()
    image3?: string;

    @IsOptional()
    @IsBase64()
    image4?: string;

    @IsOptional()
    @IsBase64()
    image5?: string;
}
