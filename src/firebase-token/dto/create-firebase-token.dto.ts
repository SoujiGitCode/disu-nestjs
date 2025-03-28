import { IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFirebaseTokenDto {
  @IsNumber()
  @Type(() => Number)
  userId: number;

  @IsString()
  token: string;

  @IsString()
  platform: string;
}
