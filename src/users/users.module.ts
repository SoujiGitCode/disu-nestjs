import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Esto define el repositorio para la entidad User
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule], // Exporta el servicio y el repositorio para otros módulos
})
export class UsersModule { }
