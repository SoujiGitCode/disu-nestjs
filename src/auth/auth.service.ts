import * as bcrypt from 'bcrypt';
import { Injectable, NotFoundException, BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus, Gender } from 'src/users/user.entity';
import { Role } from 'src/roles/role.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { MailService } from 'src/mail/mail.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
        private readonly mailService: MailService, // Inyectar MailService
    ) { }

    // Método para generar un OTP de 5 dígitos
    private generateOtp(): string {
        return Math.floor(10000 + Math.random() * 90000).toString();
    }

    // Método privado para manejar usuarios pendientes de verificación
    private async handlePendingUser(user: User): Promise<string> {
        // Generar un nuevo OTP y establecer la expiración
        const otpCode = this.generateOtp();
        user.otpCode = otpCode;
        user.otpExpiration = new Date(Date.now() + 60 * 60 * 1000); // 1 hora de expiración
        await this.userRepository.save(user);

        // Enviar OTP al correo electrónico
        try {
            await this.mailService.sendOtpEmail(user.email, otpCode);
        } catch (error) {
            console.log(error)
            throw new BadRequestException('Failed to send OTP. Please try again later.');
        }

        // Devolver el OTP
        return otpCode;
    }

    // Método de registro
    async register(userRegistrationData: RegisterUserDto): Promise<UserResponseDto & { otp: string }> {
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
    async verifyOtp(verifyOtpData: VerifyOtpDto): Promise<{ message: string }> {
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
            message: "User verified successfully."
        }
    }

    // Método para iniciar sesión
    // Método para iniciar sesión
    async login(loginData: LoginDto): Promise<{ message: string; data?: any }> {
        const { email, password } = loginData;

        // Buscar el usuario por email
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new NotFoundException('User not found.');
        }

        // Verificar la contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials.');
        }

        // Verificar el estado del usuario
        if (user.status === UserStatus.PENDING) {
            // Manejar el estado pendiente
            const otpCode = await this.handlePendingUser(user);

            return {
                message: 'Your account is pending verification. An OTP has been sent to your email.',
                data: {
                    otp: otpCode,
                    userStatus: user.status,
                },
            };
        }

        if (user.status === UserStatus.SUSPENDED) {
            return {
                message: 'Your account has been suspended. Please contact support if this is an error.',
                data: {
                    userStatus: user.status,
                },
            };
        }

        // Si el usuario está activo, generar el token JWT
        const payload = { userId: user.id, email: user.email };
        const token = this.jwtService.sign(payload);

        return {
            message: 'Login successful.',
            data: {
                token,
                userStatus: user.status,
            },
        };
    }

    // Método para solicitar la recuperación de contraseña
    async requestPasswordRecovery(email: string): Promise<{ message: string; otp?: string }> {
        // Buscar el usuario por correo electrónico
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new NotFoundException('User not found.');
        }

        // Generar un nuevo OTP y guardar en la base de datos
        const otpCode = this.generateOtp();
        user.otpCode = otpCode;
        user.otpExpiration = new Date(Date.now() + 60 * 60 * 1000); // 1 hora de expiración
        await this.userRepository.save(user);

        // Enviar el OTP por correo electrónico
        await this.mailService.sendOtpEmail(user.email, otpCode);

        return {
            message: 'A recovery email has been sent. Please check your inbox.',
            otp: otpCode,
        };
    }

    // Método para validar el OTP del recovery password
    async validateOtp(email: string, otpCode: string): Promise<{ message: string }> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user || user.otpCode !== otpCode || user.otpExpiration < new Date()) {
            throw new BadRequestException('Invalid or expired OTP.');
        }

        // Invalidar el OTP después de la validación
        user.otpCode = null;
        user.otpExpiration = null;
        await this.userRepository.save(user);

        return {
            message: 'OTP is valid. You can now reset your password.',
        };
    }

    // Método para restablecer la contraseña
    async resetPassword(email: string, newPassword: string): Promise<{ message: string }> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new NotFoundException('User not found.');
        }

        // Actualizar la contraseña
        user.password = await bcrypt.hash(newPassword, 10);
        await this.userRepository.save(user);

        return {
            message: 'Password has been reset successfully.',
        };
    }

}
