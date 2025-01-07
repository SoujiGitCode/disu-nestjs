import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extrae el token del encabezado Authorization
            ignoreExpiration: false, // validar la expiración del token
            secretOrKey: configService.get<string>('SECRET_KEY_JWT'), // Clave secreta del token
        });
    }

    async validate(payload: any) {
        // Este método devuelve el payload del token después de la validación
        return { userId: payload.userId, username: payload.username };
    }
}
