import { IsEmail, IsNotEmpty, IsString, IsDate, IsOptional, MinLength, Matches, isNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class RegisterUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty({ message: 'Password is required.' })
    // @MinLength(8, { message: 'Password must be at least 8 characters long.' })
    // @Matches(/(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/, {
    //     message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    // })
    password: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsDate()
    @Type(() => Date) // Transforma el valor a un tipo Date
    birthdate: Date;

    @IsOptional()
    @IsString()
    gender: string; // No validamos aquí los valores específicos, se hará en el servicio

    @IsOptional()
    role: number; // Esto es el ID del rol; asumimos que se valida en el servicio
}
