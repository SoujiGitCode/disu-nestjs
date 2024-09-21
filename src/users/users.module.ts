import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Registrar la entidad User
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }
