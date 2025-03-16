import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  ParseIntPipe,
  BadRequestException,
  NotFoundException,
  Logger,
  Query,
} from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { CsvImportService } from './csv-import.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

@Controller('businesses')
export class BusinessesController {
  private readonly logger = new Logger(BusinessesController.name);

  constructor(
    private readonly businessesService: BusinessesService,
    private readonly csvImportService: CsvImportService // Inyección del servicio
  ) { }

  @Post('create')
  async create(@Body() body: any) {
    try {
      const dto = plainToInstance(CreateBusinessDto, body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        this.logger.error('Errores de validación', JSON.stringify(errors));
        // Lanzar excepción con detalles claros de validación
        throw new BadRequestException({
          success: false,
          statusCode: 400,
          message: 'Validation failed',
          errors: this.formatValidationErrors(errors), // Detalles de validación
        });
      }

      const result = await this.businessesService.create(dto);

      return {
        success: true,
        message: 'Negocio creado exitosamente.',
        data: result.data,
      };
    } catch (error) {
      this.logger.error('Error al procesar la solicitud de creación', error.stack);
      // Lanzar un mensaje más genérico si no es un error de validación
      throw new BadRequestException({
        success: false,
        statusCode: 400,
        message: error.message || 'Error al crear el negocio.',
        error: error.response?.errors || 'Unknown error', // Detalles del error o un mensaje genérico
      });
    }
  }

  private formatValidationErrors(errors: ValidationError[]): any[] {
    return errors.map((error) => ({
      property: error.property, // Campo que falló la validación
      constraints: error.constraints, // Restricciones fallidas
      value: error.value, // Valor enviado que es inválido
    }));
  }

  @Put('update/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    try {
      // Convertir y validar el DTO
      const dto = plainToInstance(UpdateBusinessDto, body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        this.logger.error('Errores de validación', JSON.stringify(errors));
        // Lanzar una excepción con detalles claros
        throw new BadRequestException({
          success: false,
          statusCode: 400,
          message: 'Validation failed',
          errors: this.formatValidationErrors(errors), // Detalles de validación
        });
      }

      // Llamar al servicio para manejar la lógica de actualización
      const result = await this.businessesService.update(id, dto);

      return {
        success: true,
        message: 'Negocio actualizado exitosamente.',
        data: result.data,
      };
    } catch (error) {
      this.logger.error('Error al procesar la solicitud de actualización', error.stack);
      // Manejo de errores
      throw new BadRequestException({
        success: false,
        statusCode: 400,
        message: error.message || 'Error al actualizar el negocio.',
        error: error.response?.errors || 'Unknown error', // Detalles adicionales si existen
      });
    }
  }

  @Get('find-all')
  async findAll(@Query('getAllData') getAllData?: string) {
    try {
      // Convertir `getAllData` a booleano (NestJS lo recibe como string)
      const includeAllData = getAllData === 'true';

      // Llamar al servicio y pasar el booleano
      return await this.businessesService.findAll(includeAllData);
    } catch (error) {
      this.logger.error('Error al obtener la lista de negocios', error.stack);
      throw new BadRequestException(error.message || 'Error al obtener negocios.');
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const business = await this.businessesService.findOne(id);

      if (!business) {
        throw new NotFoundException(`Negocio con ID ${id} no encontrado.`);
      }

      return {
        success: true,
        message: 'Negocio encontrado correctamente.',
        data: business,
      };
    } catch (error) {
      this.logger.error('Error al obtener el negocio', error.stack);
      throw new BadRequestException(error.message || 'Error al obtener el negocio.');
    }
  }

  @Delete('delete/:id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    try {
      const result = await this.businessesService.delete(id);

      return {
        success: true,
        message: 'Negocio eliminado exitosamente.',
        data: result,
      };
    } catch (error) {
      this.logger.error('Error al eliminar el negocio', error.stack);
      throw new BadRequestException(error.message || 'Error al eliminar el negocio.');
    }
  }

  @Post('import-static-csv')
  async importStaticCsv() {
    try {
      const filePath = 'business-data.csv'; // Ruta fija para el archivo CSV
      await this.csvImportService.importCsv(filePath);

      return {
        success: true,
        message: 'El archivo CSV ha sido procesado exitosamente.',
      };
    } catch (error) {
      this.logger.error('Error al procesar el archivo CSV', error.stack);
      throw new BadRequestException('Error al procesar el archivo CSV.');
    }
  }
}
