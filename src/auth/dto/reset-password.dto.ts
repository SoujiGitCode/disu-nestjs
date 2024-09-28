import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    // @MinLength(8, { message: 'Password must be at least 8 characters long.' })
    // @Matches(/(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/, {
    //     message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    // })
    newPassword: string;
}
