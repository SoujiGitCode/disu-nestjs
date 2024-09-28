import * as bcrypt from 'bcrypt';
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus, Gender } from 'src/users/user.entity';
import { Role } from 'src/roles/role.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { MailService } from 'src/mail/mail.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
        private readonly mailService: MailService, // Inyectar MailService
    ) { }

    // Método para generar un OTP de 5 dígitos
    private generateOtp(): number {
        return Math.floor(10000 + Math.random() * 90000);
    }
    // Método de registro
    async register(userRegistrationData: RegisterUserDto): Promise<UserResponseDto & { otp: number }> {
        const { email, password, birthdate, gender, role } = userRegistrationData;

        // Verificar si el usuario ya existe por su email
        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new ConflictException('A user with this email already exists.');
        }

        // Buscar el rol correspondiente en la base de datos usando el ID
        const roleEntity = await this.roleRepository.findOne({ where: { id: role } });
        if (!roleEntity) {
            throw new NotFoundException('Role not found');
        }

        try {
            // Hashear la contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            // Generar el OTP de 5 dígitos
            const otpCode = this.generateOtp();

            // Establecer la fecha de expiración del OTP (1 hora a partir de ahora)
            const otpExpiration = new Date();
            otpExpiration.setHours(otpExpiration.getHours() + 1);

            // Crear y guardar el nuevo usuario
            const newUser = this.userRepository.create({
                email,
                password: hashedPassword,
                birthdate,
                gender: gender || Gender.INDEFINIDO,
                role: roleEntity,
                status: UserStatus.PENDING,
                otpCode: otpCode.toString(), // Guardar el OTP como string
                otpExpiration: otpExpiration, // Guardar la fecha de expiración
            });

            const savedUser = await this.userRepository.save(newUser);

            // Enviar correo con OTP
            await this.mailService.sendOtpEmail(email, otpCode);

            // Construir y devolver el objeto de respuesta
            return {
                id: savedUser.id,
                email: savedUser.email,
                birthdate: savedUser.birthdate,
                gender: savedUser.gender,
                status: savedUser.status,
                role: savedUser.role.name,
                otp: otpCode,
            };

        } catch (error) {
            if (error.code === '23505') {
                throw new ConflictException('Email already in use.');
            }
            throw new BadRequestException(error.message);
        }
    }


    // Método para verificar el OTP
    async verifyOtp(verifyOtpData: VerifyOtpDto): Promise<{ success: boolean; message: string }> {
        const { email, otp } = verifyOtpData;

        // Buscar el usuario por su correo electrónico
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new NotFoundException('User not found.');
        }

        // Verificar si el OTP coincide y si no ha expirado
        if (user.otpCode !== otp || new Date() > user.otpExpiration) {
            throw new BadRequestException('Invalid or expired OTP code.');
        }

        // Actualizar el estado del usuario a 'activo' y eliminar el OTP
        user.status = UserStatus.ACTIVE;
        user.otpCode = null;
        user.otpExpiration = null;
        await this.userRepository.save(user);

        return {
            "success": true,
            "message": "User verified successfully."
        }
    }
}
