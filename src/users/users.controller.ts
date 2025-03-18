import {
    Controller,
    Post,
    Get,
    Body,
    Query,
    UseInterceptors,
    Delete,
    Patch,
    UseGuards,
    Req,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import * as path from 'path';
import * as fs from 'fs';
import * as csvParser from 'csv-parser';
import * as bcrypt from 'bcrypt';
import { User, UserStatus, Gender } from './user.entity';
@Controller('users') // Ruta base: '/users'
@UseInterceptors(FileInterceptor(''))//habilita la recepción de datos como FormData para todas las rutas!
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Patch('update') // Ruta: '/users/update'
    async updateUser(@Body() updateUserDto: UpdateUserDto) {
        return await this.usersService.updateUser(updateUserDto.id, updateUserDto);
    }

    @Delete('delete') // Ruta: '/users/delete'
    async softDeleteUser(@Query('id') id: string) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            throw new BadRequestException('El id proporcionado no es válido.');
        }
        return await this.usersService.softDeleteUser(numericId);
    }

    @Get('list') // Ruta: '/users/list'
    async getAllUsers() {
        return await this.usersService.getAllUsers();
    }

    @Get('detail') // Ruta: '/users/detail'
    async getUserById(@Query('id') id: string) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            throw new BadRequestException('El id proporcionado no es válido.');
        }
        return await this.usersService.getUserById(numericId);
    }

    @UseGuards(JwtAuthGuard) // Protege el endpoint con el guard de JWT
    @Get('me')
    async getProfile(@Req() req: any) {
        const userId = req.user.userId; // Obtiene el userId del token
        const user = await this.usersService.getUserById(userId);

        if (!user.data.id) {
            throw new NotFoundException('Usuario no encontrado.');
        }

        const userData = user.data;
        return {
            success: true,
            message: 'Datos del usuario obtenidos correctamente.',
            data: userData,
        };
    }

    @Post('migrate-old-users')
    async migrateOldUsers() {
        try {
            const filePath = 'old-users.csv';

            if (!fs.existsSync(filePath)) {
                throw new BadRequestException('El archivo old-users.csv no existe en el root del proyecto.');
            }

            const users: Partial<User>[] = [];
            const stream = fs.createReadStream(filePath).pipe(csvParser());

            for await (const row of stream) {
                try {
                    // Verificar si el usuario ya existe en la base de datos
                    const existingUser = await this.usersService.findByEmail(row['email']);
                    if (existingUser) {
                        console.log(`⚠️ Usuario ya existente, omitido: ${row['email']}`);
                        continue; // Saltar al siguiente usuario
                    }

                    // Generar contraseña encriptada
                    const hashedPassword = await bcrypt.hash('defaultPassword123', 10);

                    // Crear usuario con valores predeterminados
                    const user: Partial<User> = {
                        email: row['email'],
                        name: row['name'],
                        lastName: row['last_name'],
                        password: hashedPassword,
                        birthdate: new Date('1909-09-09'),
                        gender: Gender.INDEFINIDO,
                        isConfirmed: false,
                        status: UserStatus.ACTIVE,
                        role: { id: 1 } as any,
                    };

                    users.push(user);
                    console.log(`✅ Usuario preparado para migración: ${user.email}`);
                } catch (error) {
                    console.error(`⚠️ Error procesando usuario ${row['email']}:`, error);
                }
            }

            console.log(`🔹 Total de usuarios nuevos a migrar: ${users.length}`);

            if (users.length === 0) {
                throw new BadRequestException('No se encontraron usuarios nuevos para migrar.');
            }

            await this.usersService.migrateUsers(users);

            return {
                success: true,
                message: `Migración completada. ${users.length} usuarios migrados correctamente.`,
            };

        } catch (error) {
            console.error('❌ Error en la migración:', error);
            throw new BadRequestException(error.message || 'Error al procesar la migración de usuarios.');
        }
    }

}
