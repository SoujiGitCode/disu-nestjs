import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Business } from './business.entity';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { ConfigService } from '@nestjs/config';

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
    // Obtener la URL base desde el archivo .env
    const baseUrl = this.configService.get<string>('API_BASE_URL');

    // Obtener todos los negocios
    const businesses = await this.businessesRepository.find();

    // Modificar las URLs relativas a completas
    const sanitizedBusinesses = businesses.map((business) => ({
      ...business,
      logoUrl: `${baseUrl}${business.logoUrl}`, // Concatenar dominio base
      imageUrls: business.imageUrls.map((url) => `${baseUrl}${url}`), // Procesar array de imágenes
    }));

    return {
      message: 'Lista de negocios obtenida correctamente.',
      data: sanitizedBusinesses,
    };
  }


  async findOne(id: number): Promise<Business> {
    const business = await this.businessesRepository.findOne({ where: { id } });
    if (!business) {
      throw new BadRequestException(`Business with ID ${id} not found`);
    }
    return business;
  }


  async update(id: number, updateBusinessDto: UpdateBusinessDto): Promise<Business> {
    const business = await this.findOne(id); // Llama a `findOne` para verificar si existe el negocio

    // Filtrar solo las propiedades que tienen valores definidos
    const updatedFields = Object.entries(updateBusinessDto).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});

    // Aplicar solo los campos actualizados al negocio existente
    Object.assign(business, updatedFields);

    // Opcional: Maneja la lógica de actualizar imágenes o archivos relacionados aquí si corresponde

    return this.businessesRepository.save(business); // Guarda los cambios
  }


  async remove(id: number): Promise<void> {
    const business = await this.findOne(id); // Verifica que el negocio exista
    await this.businessesRepository.remove(business); // Elimina el negocio de la base de datos
  }

}
