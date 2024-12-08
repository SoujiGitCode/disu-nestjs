import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessesService } from './businesses.service';
import { BusinessesController } from './businesses.controller';
import { Business } from './business.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Business])], // Registrar la entidad `Business`
  controllers: [BusinessesController],
  providers: [BusinessesService],
  exports: [BusinessesService, TypeOrmModule], // Exportar el servicio si será usado en otros módulos
})
export class BusinessesModule { }
