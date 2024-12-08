import { IsOptional, IsString, IsDate, IsInt } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateUserDto {
    @IsInt()
    @Transform(({ value }) => parseInt(value, 10)) // Convertir id a número
    id: number;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => (value === "" ? undefined : value)) // Ignorar valores vacíos
    name?: string;

    @IsOptional()
    @IsDate()
    @Transform(({ value }) => (value ? new Date(value) : undefined)) // Manejo de fechas vacías
    @Type(() => Date)
    birthdate?: Date;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => (value === "" ? undefined : value)) // Ignorar valores vacíos
    gender?: string;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => (value === "" ? undefined : value)) // Ignorar valores vacíos
    status?: string;
}
