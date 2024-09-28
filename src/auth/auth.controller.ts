import { Controller, Post, Body, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth') // Ruta base: '/auth'
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @UseInterceptors(FileInterceptor('')) //habilita la recepción de datos como FormData
    async register(@Body() createUserDto: RegisterUserDto) {
        return await this.authService.register(createUserDto);
    }

    @Post('verify-otp') // Ruta para verificar el OTP
    @UseInterceptors(FileInterceptor(''))
    async verifyOtp(@Body() verifyOtpData: VerifyOtpDto) {
        return await this.authService.verifyOtp(verifyOtpData);
    }

    @Post('login') // Endpoint de login
    @UseInterceptors(FileInterceptor(''))
    async login(@Body() loginData: LoginDto) {
        return await this.authService.login(loginData);
    }
}
