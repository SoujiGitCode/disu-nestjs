import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  Logger,
  Get,
  Put,
  Param,
  Delete,
  ParseIntPipe,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { CreateBusinessDto } from './dto/create-business.dto';
import { BusinessesService } from './businesses.service'; // Importar el servicio
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Controller('businesses')
export class BusinessesController {
  private readonly logger = new Logger(BusinessesController.name);

  constructor(private readonly businessService: BusinessesService) { } // Inyección del servicio

  @Post('create')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: null, // El servicio maneja los archivos
    }),
  )
  async createBusiness(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any, // Recibimos los datos del formulario
  ) {
    try {
      // Convertimos y validamos los datos del formulario
      const dto = plainToInstance(CreateBusinessDto, body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        throw new BadRequestException(errors);
      }

      // Preparar las imágenes en un formato adecuado para el servicio
      const processedFiles = {};
      files.forEach((file) => {
        if (!processedFiles[file.fieldname]) {
          processedFiles[file.fieldname] = [];
        }
        processedFiles[file.fieldname].push(file);
      });

      // Llamar al servicio para manejar la lógica
      const business = await this.businessService.create(dto, processedFiles);

      return {
        message: 'Business created successfully!',
        data: business,
      };
    } catch (error) {
      this.logger.error('Error processing request', error.stack);
      throw new BadRequestException(error.message || 'File upload failed');
    }
  }

  @Get('find-all')
  async findAll() {
    return this.businessService.findAll();
  }

  @Get(':id')
  async findOne(@Query('id', ParseIntPipe) id: number) {
    const business = await this.businessService.findOne(id);

    if (!business) {
      throw new NotFoundException(`Negocio con ID ${id} no encontrado.`);
    }

    return {
      success: true,
      message: 'Negocio encontrado correctamente.',
      data: business,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateBusinessDto: UpdateBusinessDto,
  ) {
    return this.businessService.update(id, updateBusinessDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.businessService.delete(id);
  }


}
