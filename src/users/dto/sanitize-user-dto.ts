import { Expose } from 'class-transformer';

export class SanitizedUserDto {
    @Expose()
    id: number;

    @Expose()
    email: string;

    @Expose()
    name: string;

    @Expose()
    lastName: string;

    @Expose()
    birthdate: string;

    @Expose()
    gender: string;

    @Expose()
    status: string;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;

    // No incluir campos sensibles como `password`, `otpCode`, o `otpExpiration`
}
