import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  BadRequestException,
  NotFoundException,
  Logger,
  Delete,
  UseInterceptors
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('transactions')
@UseInterceptors(FileInterceptor('')) // Habilita la recepción de FormData para todas las rutas
export class TransactionsController {
  private readonly logger = new Logger(TransactionsController.name);

  constructor(private readonly transactionsService: TransactionsService) { }

  @Post('create')
  async create(@Body() body: any) {
    try {
      const dto = plainToInstance(CreateTransactionDto, body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        this.logger.error('Errores de validación', JSON.stringify(errors));
        throw new BadRequestException({
          success: false,
          statusCode: 400,
          message: 'Error de validación',
          errores: this.formatValidationErrors(errors),
        });
      }

      const transaction = await this.transactionsService.create(dto);

      return {
        success: true,
        message: 'Transacción creada exitosamente.',
        data: transaction,
      };
    } catch (error) {
      this.logger.error('Error al procesar la solicitud de creación', error.stack);
      throw new BadRequestException({
        success: false,
        statusCode: 400,
        message: error.message || 'Error al crear la transacción.',
        error: error.response?.errors || 'Error desconocido',
      });
    }
  }

  @Get('find-all')
  async findAll() {
    try {
      const transactions = await this.transactionsService.findAll();

      return {
        success: true,
        message: 'Lista de transacciones obtenida correctamente.',
        data: transactions,
      };
    } catch (error) {
      this.logger.error('Error al obtener transacciones', error.stack);
      throw new BadRequestException(error.message || 'Error al obtener transacciones.');
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const transaction = await this.transactionsService.findOne(id);

      if (!transaction) {
        throw new NotFoundException(`Transacción con ID ${id} no encontrada.`);
      }

      return {
        success: true,
        message: 'Transacción encontrada correctamente.',
        data: transaction,
      };
    } catch (error) {
      this.logger.error(`Error al obtener la transacción con ID ${id}`, error.stack);
      throw new BadRequestException(error.message || `Error al obtener la transacción con ID ${id}.`);
    }
  }

  @Delete('delete/:id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    try {
      const result = await this.transactionsService.delete(id);

      return {
        success: true,
        message: 'Transacción eliminada exitosamente.',
        data: result,
      };
    } catch (error) {
      this.logger.error(`Error al eliminar la transacción con ID ${id}`, error.stack);
      throw new BadRequestException(error.message || `Error al eliminar la transacción con ID ${id}.`);
    }
  }

  private formatValidationErrors(errors: ValidationError[]): any[] {
    return errors.map((error) => ({
      propiedad: error.property,
      restricciones: error.constraints,
      valor: error.value,
    }));
  }
}
