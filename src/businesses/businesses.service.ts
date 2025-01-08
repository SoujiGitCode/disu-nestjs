import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Business } from './business.entity';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { ConfigService } from '@nestjs/config';
import { validate } from 'class-validator';
import { FastCreateBusinessDto } from './dto/fast-create-business-dto';

@Injectable()
export class BusinessesService {
  private readonly uploadsDir = process.env.UPLOADS_DIR || './uploads';

  constructor(
    @InjectRepository(Business)
    private readonly businessesRepository: Repository<Business>,
    private readonly configService: ConfigService, // Inyecta ConfigService
  ) { }


  async create(createBusinessDto: CreateBusinessDto, files: any): Promise<Business> {
    // Crear el negocio con datos básicos
    const business = this.businessesRepository.create({
      ...createBusinessDto,
      logoUrl: null,
      imageUrls: [],
    });

    const savedBusiness = await this.businessesRepository.save(business);
    const businessId = savedBusiness.id.toString();

    // Crear directorios para logo e imágenes
    const logoDir = path.join(this.uploadsDir, 'businesses_logos', businessId);
    const imagesDir = path.join(this.uploadsDir, 'businesses_images', businessId);
    [logoDir, imagesDir].forEach((dir) => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    // Procesar y guardar el logo si está presente
    if (files?.logo?.[0]) {
      const logoPath = path.join(logoDir, 'logo.png');
      fs.writeFileSync(logoPath, files.logo[0].buffer); // Guardar el buffer del archivo
      savedBusiness.logoUrl = `/uploads/businesses_logos/${businessId}/logo.png`;
    }

    // Procesar y guardar imágenes adicionales si están presentes
    const imageUrls = [];
    ['image1', 'image2', 'image3', 'image4', 'image5'].forEach((field, index) => {
      if (files?.[field]?.[0]) {
        const imagePath = path.join(imagesDir, `${index + 1}.jpg`);
        fs.writeFileSync(imagePath, files[field][0].buffer);
        imageUrls.push(`/uploads/businesses_images/${businessId}/${index + 1}.jpg`);
      }
    });
    savedBusiness.imageUrls = imageUrls;

    // Guardar negocio actualizado con las rutas de las imágenes
    return this.businessesRepository.save(savedBusiness);
  }

  async findAll(): Promise<{ message: string; data: Business[] }> {
    // Obtener todos los negocios
    const businesses = await this.businessesRepository.find();

    // Modificar las URLs relativas a completas y manejar casos de valores nulos
    const sanitizedBusinesses = businesses.map((business) => ({
      ...business,
      logoUrl: business.logoUrl ? `${business.logoUrl}` : null, // Manejar caso nulo
      imageUrls: business.imageUrls ? business.imageUrls.map((url) => `${url}`) : [], // Manejar caso nulo o vacío
    }));

    return {
      message: 'Lista de negocios obtenida correctamente.',
      data: sanitizedBusinesses,
    };
  }

  async findOne(id: number): Promise<Business | null> {
    if (!id || isNaN(Number(id))) {
      throw new Error(`ID inválido recibido en findOne: ${id}`);
    }

    return this.businessesRepository.findOne({ where: { id } });
  }


  async update(id: number, updateBusinessDto: UpdateBusinessDto): Promise<Business> {
    const business = await this.findOne(id);

    const updatedFields = Object.entries(updateBusinessDto).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});

    Object.assign(business, updatedFields);

    // Validar la entidad después de actualizarla
    const errors = await validate(business);
    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: errors.map((err) => ({
          property: err.property,
          constraints: err.constraints,
        })),
      });
    }

    return this.businessesRepository.save(business);
  }

  async delete(id: number): Promise<{ success: boolean; message: string }> {
    const business = await this.findOne(id); // Verificar si el negocio existe

    if (!business) {
      throw new NotFoundException('Negocio no encontrado.');
    }

    await this.businessesRepository.delete(id); // Eliminar el negocio

    return {
      success: true,
      message: 'Negocio eliminado exitosamente.',
    };
  }

  async fastCreate(createBusinessDto: FastCreateBusinessDto): Promise<{ success: boolean; message: string; data: Business }> {
    const { image1, image2, image3, image4, image5, ...businessData } = createBusinessDto;

    // Crear un negocio con los datos proporcionados
    const business = this.businessesRepository.create({
      ...businessData,
      logoUrl: createBusinessDto.logo || null,
      imageUrls: [image1, image2, image3, image4, image5].filter((url) => url !== undefined), // Filtrar imágenes definidas
    });

    // Guardar el negocio en la base de datos
    const savedBusiness = await this.businessesRepository.save(business);

    // Devolver una respuesta clara
    return {
      success: true,
      message: 'Negocio creado exitosamente.',
      data: savedBusiness,
    };
  }


  async fastUpdate(
    id: number,
    updateBusinessDto: UpdateBusinessDto,
  ): Promise<{ success: boolean; message: string; data: Business }> {
    const { delete_logo, delete_images, image1, image2, image3, image4, image5, ...businessData } = updateBusinessDto;

    // Buscar el negocio existente
    const business = await this.findOne(id);

    if (!business) {
      throw new Error('Negocio no encontrado.');
    }

    // Limpiar logo si se solicita
    if (delete_logo) {
      business.logoUrl = null;
    }

    // Limpiar imágenes si se solicita
    if (delete_images) {
      business.imageUrls = [];
    } else {
      // Actualizar imágenes específicas
      const updatedImages = [...business.imageUrls]; // Copia las imágenes existentes
      const newImages = [image1, image2, image3, image4, image5];
      newImages.forEach((url, index) => {
        if (url !== undefined && url !== null && url !== '') {
          updatedImages[index] = url; // Actualiza solo los índices específicos
        }
      });
      business.imageUrls = updatedImages;
    }

    // Filtrar solo las propiedades con valores válidos y aplicarlas
    Object.entries(businessData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        business[key] = value;
      }
    });

    // Guardar los cambios
    const updatedBusiness = await this.businessesRepository.save(business);

    // Devolver la respuesta
    return {
      success: true,
      message: 'Negocio actualizado exitosamente.',
      data: updatedBusiness,
    };
  }




}
