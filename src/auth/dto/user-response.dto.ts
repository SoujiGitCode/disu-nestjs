export class UserResponseDto {
    message: string;
    data: {
        id: number;
        email: string;
        birthdate: Date | string;
        gender: string;
        name: string;
        status: string;
        role: string;
    }

}
