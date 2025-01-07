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
import { format } from 'date-fns';

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

    // Método para generar un OTP de 6 dígitos
    private generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Método para generar JWT
    private generateToken(payload: any): string {
        return this.jwtService.sign(payload, {
            expiresIn: '365d', // Configuración del tiempo de expiración
        });
    }

    // Método para Validar JWT
    async validateToken(token: string): Promise<any> {
        try {
            return this.jwtService.verify(token); // Verifica la firma y expiración del token
        } catch (error) {
            console.error('Error al validar token:', error);
            if (error.name === 'TokenExpiredError') {
                throw new UnauthorizedException('El token ha expirado.');
            } else if (error.name === 'JsonWebTokenError') {
                throw new UnauthorizedException('El token es inválido.');
            } else {
                throw new UnauthorizedException('No se pudo validar el token.');
            }
        }
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
            throw new BadRequestException('No se pudo enviar OTP. Por favor inténtalo de nuevo más tarde.');
        }

        // Devolver el OTP
        return otpCode;
    }

    // Método de registro
    async register(userRegistrationData: RegisterUserDto): Promise<UserResponseDto> {
        const { email, password, birthdate, gender, role, name, lastName } = userRegistrationData;

        // Verificar si el usuario ya existe por su email
        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new ConflictException('Ya existe un usuario con este email');
        }
        // Buscar el rol correspondiente en la base de datos usando el ID, o asignar el rol con ID 1 por defecto
        const roleEntity = role
            ? await this.roleRepository.findOne({ where: { id: role } })
            : await this.roleRepository.findOne({ where: { id: 1 } });

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
                birthdate: format(new Date(birthdate), 'dd-MM-yyyy'),
                gender: gender || Gender.INDEFINIDO,
                role: roleEntity,
                status: UserStatus.PENDING,
                otpCode: otpCode,
                name: name,
                lastName: lastName,
                otpExpiration: otpExpiration,
            });

            const savedUser = await this.userRepository.save(newUser);

            // Enviar correo con OTP
            await this.mailService.sendOtpEmail(email, otpCode);

            // Transformar el formato de la fecha antes de devolverla en la respuesta
            return {
                message: 'Usuario registrado correctamente!',
                data: {
                    id: savedUser.id,
                    email: savedUser.email,
                    birthdate: format(new Date(savedUser.birthdate), 'dd-MM-yyyy'), // Formato de fecha ajustado
                    name: savedUser.name,
                    lastName: savedUser.lastName,
                    gender: savedUser.gender,
                    status: savedUser.status,
                    role: savedUser.role.name,
                }
            };

        } catch (error) {
            if (error.code === '23505') {
                throw new ConflictException('Dirección de correo ya registrada.');
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
            throw new NotFoundException('Usuario no encontrado.');
        }

        // Verificar si el OTP coincide y si no ha expirado
        if (user.otpCode !== otp || new Date() > user.otpExpiration) {
            throw new BadRequestException('Código inválido o caducado.');
        }

        // Actualizar el estado del usuario a 'activo' y eliminar el OTP
        user.status = UserStatus.ACTIVE;
        user.otpCode = null;
        user.otpExpiration = null;
        await this.userRepository.save(user);

        return {
            message: "Usuario verificada con éxito."
        }
    }

    // Método para iniciar sesión
    async login(loginData: LoginDto): Promise<{ message: string; data?: any }> {
        const { email, password } = loginData;

        // Buscar el usuario por email
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado.');
        }

        // Verificar la contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciales Invalidas.');
        }

        // Verificar el estado del usuario
        if (user.status === UserStatus.PENDING) {
            // Manejar el estado pendiente
            await this.handlePendingUser(user);

            return {
                message: 'Tu cuenta está pendiente de verificación. Se ha enviado una OTP a su correo electrónico.',
                data: {
                    userStatus: user.status,
                },
            };
        }

        if (user.status === UserStatus.SUSPENDED) {
            return {
                message: 'Tu cuenta ha sido suspendida. Comuníquese con el soporte si se trata de un error.',
                data: {
                    userStatus: user.status,
                },
            };
        }


        // Si el usuario está activo, generar el token JWT
        const payload = { userId: user.id, email: user.email };
        const token = this.generateToken(payload);
        return {
            message: 'Inicio de sesión exitoso.',
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
            throw new NotFoundException('Usuario no encontrado.');
        }

        // Generar un nuevo OTP y guardar en la base de datos
        const otpCode = this.generateOtp();
        user.otpCode = otpCode;
        user.otpExpiration = new Date(Date.now() + 60 * 60 * 1000); // 1 hora de expiración
        await this.userRepository.save(user);

        // Enviar el OTP por correo electrónico
        await this.mailService.sendOtpEmail(user.email, otpCode);

        return {
            message: 'Se ha enviado un correo electrónico de recuperación. Por favor revisa tu bandeja de entrada.',
        };
    }

    // Método para validar el OTP del recovery password
    async validateOtp(email: string, otpCode: string): Promise<{ message: string }> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user || user.otpCode !== otpCode || user.otpExpiration < new Date()) {
            throw new BadRequestException('Código inválido o caducado.');
        }

        // Invalidar el OTP después de la validación
        user.otpCode = null;
        user.otpExpiration = null;
        await this.userRepository.save(user);

        return {
            message: 'Código validado. Ahora puedes restablecer tu contraseña',
        };
    }

    // Método para restablecer la contraseña
    async resetPassword(email: string, newPassword: string): Promise<{ message: string }> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado.');
        }

        // Actualizar la contraseña
        user.password = await bcrypt.hash(newPassword, 10);
        await this.userRepository.save(user);

        return {
            message: 'La contraseña se ha restablecido correctamente.',
        };
    }

    // Método para verificar si un usuario existe
    async checkUserExists(email: string): Promise<{ message: string; data?: any }> {
        const user = await this.userRepository.findOne({ where: { email } });

        if (user) {
            return {
                message: 'Usuario ya registrado.',
                data: {
                    exists: true,
                },
            };
        } else {
            return {
                message: 'Usuario no encontrado.',
                data: {
                    exists: false,
                },
            };
        }
    }
}
