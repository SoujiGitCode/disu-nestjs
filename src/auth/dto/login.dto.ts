// src/auth/dto/login.dto.ts
import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
