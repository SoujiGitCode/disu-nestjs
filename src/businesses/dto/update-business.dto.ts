import { PartialType } from '@nestjs/mapped-types';
import { CreateBusinessDto } from './create-business.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateBusinessDto extends PartialType(CreateBusinessDto) {
    // Campos para limpiar logo e imágenes, transformados a boolean
    @IsOptional()
    @Transform(({ value }) => value?.toLowerCase() === 'true')
    @IsBoolean()
    delete_logo?: boolean;

    @IsOptional()
    @Transform(({ value }) => value?.toLowerCase() === 'true')
    @IsBoolean()
    delete_images?: boolean;
}
