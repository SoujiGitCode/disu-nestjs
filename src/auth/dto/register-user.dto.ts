import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString, IsOptional, IsEmail } from 'class-validator';
import { parseISO, isValid } from 'date-fns';

export class RegisterUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    password: string;

    @IsString()
    name: string;

    @IsString()
    lastName: string;

    @IsNotEmpty()
    @IsDate()
    @Transform(({ value }) => {
        if (!value) return null;

        try {
            // Parsear fecha ISO (YYYY-MM-DD)
            const parsedDate = parseISO(value);
            if (!isValid(parsedDate)) {
                throw new Error('Invalid date format. Expected YYYY-MM-DD.');
            }
            return parsedDate;
        } catch (error) {
            console.log(error)
            throw new Error('Invalid date format. Expected YYYY-MM-DD.');
        }
    })
    birthdate: Date;

    @IsOptional()
    @IsString()
    gender: string;

    @IsOptional()
    role: number;
}
