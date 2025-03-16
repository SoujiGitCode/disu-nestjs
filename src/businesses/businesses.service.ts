import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(createBusinessDto: CreateBusinessDto): Promise<{ success: boolean; message: string; data: Business }> {
    const { images, weeklySchedule, ...businessData } = createBusinessDto;

    // Crear un negocio con datos proporcionados o inicializar valores predeterminados
    const business = this.businessesRepository.create({
      ...businessData,
      logo: createBusinessDto.logo || null,
      images: images || {
        image1: null,
        image2: null,
        image3: null,
        image4: null,
        instagram: null,
      },
      weeklySchedule: weeklySchedule || [
        { day: 'Monday', status: 'disabled', openingHour: null, closingHour: null },
        { day: 'Tuesday', status: 'disabled', openingHour: null, closingHour: null },
        { day: 'Wednesday', status: 'disabled', openingHour: null, closingHour: null },
        { day: 'Thursday', status: 'disabled', openingHour: null, closingHour: null },
        { day: 'Friday', status: 'disabled', openingHour: null, closingHour: null },
        { day: 'Saturday', status: 'disabled', openingHour: null, closingHour: null },
        { day: 'Sunday', status: 'disabled', openingHour: null, closingHour: null },
      ],
    });

    // Guardar el negocio en la base de datos
    const savedBusiness = await this.businessesRepository.save(business);

    // Devolver una respuesta clara
    return {
      success: true,
      message: 'Negocio creado exitosamente.',
      data: savedBusiness, // savedBusiness incluye el id y campos generados por la DB
    };
  }


  async findAll(getAllData?: boolean): Promise<{ message: string; data: Partial<Business>[] }> {
    // Obtener todos los negocios ordenados por ID ascendente
    const businesses = await this.businessesRepository.find({
      order: { id: 'ASC' }, // Ordenar por ID ascendente
    });

    // Filtrar los datos de cada negocio dependiendo de `getAllData`
    const sanitizedBusinesses = businesses.map((business) => {
      if (getAllData) {
        return { ...business }; // Devuelve todo si `getAllData` es `true`
      }

      // Devuelve solo los campos específicos si `getAllData` no está presente o es `false`
      return {
        id: business.id,
        name: business.name,
        representative: business.representative,
        address: business.address,
        discount: business.discount,
        status: business.status,
        logo: business.logo || null, // Si logo es nulo, mantenerlo como null
      };
    });

    return {
      message: 'Lista de negocios obtenida correctamente.',
      data: sanitizedBusinesses,
    };
  }



  async findOne(id: number): Promise<Business | null> {
    if (!id || isNaN(Number(id))) {
      throw new Error(`ID inválido recibido en findOne: ${id}`);
    }

    const business = await this.businessesRepository.findOne({ where: { id } });

    if (!business) {
      return null;
    }

    // Sanitizar el negocio encontrado
    return {
      ...business,
      logo: business.logo || null,
      images: business.images || {
        image1: null,
        image2: null,
        image3: null,
        image4: null,
        instagram: null,
      },
      weeklySchedule: business.weeklySchedule || [
        { day: 'Monday', status: 'disabled', openingHour: null, closingHour: null },
        { day: 'Tuesday', status: 'disabled', openingHour: null, closingHour: null },
        { day: 'Wednesday', status: 'disabled', openingHour: null, closingHour: null },
        { day: 'Thursday', status: 'disabled', openingHour: null, closingHour: null },
        { day: 'Friday', status: 'disabled', openingHour: null, closingHour: null },
        { day: 'Saturday', status: 'disabled', openingHour: null, closingHour: null },
        { day: 'Sunday', status: 'disabled', openingHour: null, closingHour: null },
      ],
      googleMapsUrl: business.googleMapsUrl || null,
    };
  }


  async update(
    id: number,
    updateBusinessDto: UpdateBusinessDto,
  ): Promise<{ success: boolean; message: string; data: Business }> {
    const business = await this.findOne(id);

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Manejar eliminación de horario semanal
    if (updateBusinessDto.delete_schedule) {
      business.weeklySchedule = [
        { day: 'Monday', status: 'disabled', openingHour: null, closingHour: null },
        { day: 'Tuesday', status: 'disabled', openingHour: null, closingHour: null },
        { day: 'Wednesday', status: 'disabled', openingHour: null, closingHour: null },
        { day: 'Thursday', status: 'disabled', openingHour: null, closingHour: null },
        { day: 'Friday', status: 'disabled', openingHour: null, closingHour: null },
        { day: 'Saturday', status: 'disabled', openingHour: null, closingHour: null },
        { day: 'Sunday', status: 'disabled', openingHour: null, closingHour: null },
      ];
    }

    // Manejar actualización de weeklySchedule
    if (updateBusinessDto.weeklySchedule) {
      const updatedSchedule = [...(business.weeklySchedule || [])];

      updateBusinessDto.weeklySchedule.forEach((newDay) => {
        const existingDayIndex = updatedSchedule.findIndex(
          (day) => day.day === newDay.day,
        );

        const defaultDay = {
          status: 'disabled',
          openingHour: null,
          closingHour: null,
        };

        if (existingDayIndex !== -1) {
          // Si el día ya existe, actualizarlo
          updatedSchedule[existingDayIndex] = {
            ...updatedSchedule[existingDayIndex],
            ...newDay,
            openingHour: newDay.openingHour ?? defaultDay.openingHour,
            closingHour: newDay.closingHour ?? defaultDay.closingHour,
          };
        } else {
          // Si no existe, agregarlo con valores predeterminados
          updatedSchedule.push({
            ...defaultDay,
            ...newDay,
            openingHour: newDay.openingHour ?? defaultDay.openingHour,
            closingHour: newDay.closingHour ?? defaultDay.closingHour,
          });
        }
      });

      business.weeklySchedule = updatedSchedule;
    }

    // Manejar eliminación de logo
    if (updateBusinessDto.delete_logo) {
      business.logo = null;
    }

    // Manejar eliminación de imágenes
    if (updateBusinessDto.delete_images) {
      business.images = {
        image1: null,
        image2: null,
        image3: null,
        image4: null,
        instagram: null,
      };
    }

    // Manejar actualización de imágenes (sin sobreescribir el objeto completo)
    if (updateBusinessDto.images) {
      business.images = {
        ...(business.images || {
          image1: null,
          image2: null,
          image3: null,
          image4: null,
          instagram: null,
        }),
        ...updateBusinessDto.images, // Actualizar solo las propiedades enviadas
      };
    }

    // Actualizar otros campos (sin afectar weeklySchedule e imágenes directamente)
    const { weeklySchedule, delete_schedule, delete_logo, delete_images, images, ...otherFields } = updateBusinessDto;
    Object.assign(business, otherFields);

    // Guardar los cambios
    const updatedBusiness = await this.businessesRepository.save(business);

    // Reordenar las propiedades de cada día en weeklySchedule (si existe)
    if (updatedBusiness.weeklySchedule) {
      updatedBusiness.weeklySchedule = updatedBusiness.weeklySchedule.map((schedule) => {
        const { day, ...rest } = schedule;
        return { day, ...rest }; // Asegura que 'day' sea la primera propiedad
      });
    }

    // Retornar la respuesta en el formato requerido
    return {
      success: true,
      message: 'Negocio actualizado exitosamente.',
      data: {
        ...updatedBusiness,
        weeklySchedule: updatedBusiness.weeklySchedule || [], // Asegurar que siempre sea un array
        images: updatedBusiness.images || {}, // Asegurar que siempre sea un objeto
      },
    };
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




}
