import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './permission.entity';
import { PermissionsService } from './permissions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Permission])],  // Registrar la entidad Permission
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule { }
