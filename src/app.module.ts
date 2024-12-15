import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { User } from './users/user.entity';
import { Role } from './roles/role.entity';
import { Permission } from './permissions/permission.entity';
import { RolesModule } from './roles/roles.module';
import { MailModule } from './mail/mail.module';
import { UsersModule } from './users/users.module';
import { BusinessesModule } from './businesses/businesses.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // Sirve archivos desde ./uploads
      serveRoot: '/files', // Hace que estén accesibles desde /files/
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      // logging: true,
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: true, // solo para development, quitar al tener la db completada y sincronizada
    }),
    TypeOrmModule.forFeature([User, Role, Permission]),
    RolesModule, // RolesModule
    MailModule, // MailModule
    AuthModule, // AuthModule
    UsersModule, // UsersModule
    BusinessesModule,
  ],
  controllers: [AppController], //controladores
  providers: [AppService], // providers
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // Aplica el middleware a todas las rutas
  }
}
