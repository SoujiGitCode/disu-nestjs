import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module'; // Importa el UsersModule
import { JwtModule } from '@nestjs/jwt';
import { RolesModule } from 'src/roles/roles.module';
import { MailModule } from '@src/mail/mail.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    MailModule, // MailModule
    RolesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule], // Importar ConfigModule para usar ConfigService
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('SECRET_KEY_JWT'), // Usar ConfigService para obtener la clave secreta desde el .env
        signOptions: { expiresIn: '60m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule { }
