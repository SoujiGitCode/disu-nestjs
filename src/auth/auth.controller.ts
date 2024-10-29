import { Controller, Post, Body, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';
import { RequestPasswordRecoveryDto } from './dto/request-password-recovery.dto';
import { ValidateOtpDto } from './dto/validate-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth') // Ruta base: '/auth'
@UseInterceptors(FileInterceptor(''))//habilita la recepción de datos como FormData para todas las rutas!
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(@Body() createUserDto: RegisterUserDto) {
        return await this.authService.register(createUserDto);
    }

    @Post('verify-otp') // Ruta para verificar el OTP
    async verifyOtp(@Body() verifyOtpData: VerifyOtpDto) {
        return await this.authService.verifyOtp(verifyOtpData);
    }

    @Post('login') // Endpoint de login
    async login(@Body() loginData: LoginDto) {
        return await this.authService.login(loginData);
    }

    @Post('password-recovery')
    async requestPasswordRecovery(@Body() dto: RequestPasswordRecoveryDto) {
        return await this.authService.requestPasswordRecovery(dto.email);
    }

    @Post('verify-otp-password')
    async validateOtp(@Body() dto: ValidateOtpDto) {
        return await this.authService.validateOtp(dto.email, dto.otp);
    }

    @Post('reset-password')
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return await this.authService.resetPassword(dto.email, dto.newPassword);
    }
    @Post('check-user-exists')
    async checkUserExists(@Body('email') email: string) {
        return await this.authService.checkUserExists(email);
    }
}
