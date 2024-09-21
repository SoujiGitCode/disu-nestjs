import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './role.entity';
import { RolesService } from './roles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],  // Registrar la entidad Role
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule { }
