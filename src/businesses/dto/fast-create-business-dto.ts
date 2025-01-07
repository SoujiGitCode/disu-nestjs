import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, IsUrl, IsNumber, Min, Max, IsEmail, IsArray } from 'class-validator';

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
    @IsArray()
    @Transform(({ value }) => {
        // Verificar si es una cadena en formato de array
        if (typeof value === 'string') {
            try {
                const parsed = value.replace(/[\[\]']/g, '').split(',').map((v) => v.trim());
                if (!Array.isArray(parsed)) throw new Error();
                return parsed;
            } catch {
                throw new Error('Formato inválido para paymentMethods. Debe ser un array o cadena en formato [item1, item2].');
            }
        }
        return value;
    })
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

    @IsOptional()
    @IsString() // Horas de apertura como string (e.g., "08:00:00")
    openingHour?: string;

    @IsOptional()
    @IsString() // Horas de cierre como string (e.g., "18:00:00")
    closingHour?: string;

    @IsOptional()
    @IsArray()
    @Transform(({ value }) => {
        // Verificar si es una cadena en formato de array
        if (typeof value === 'string') {
            try {
                const parsed = value.replace(/[\[\]']/g, '').split(',').map((v) => v.trim());
                if (!Array.isArray(parsed)) throw new Error();
                return parsed;
            } catch {
                throw new Error('Formato inválido para openingDays. Debe ser un array o cadena en formato [item1, item2].');
            }
        }
        return value;
    })
    @IsString({ each: true })
    openingDays?: string[];
}
