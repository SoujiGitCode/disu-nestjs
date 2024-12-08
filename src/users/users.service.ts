import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { SanitizedUserDto } from './dto/sanitize-user-dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async create(userData: Partial<User>): Promise<User> {
        const newUser = this.usersRepository.create(userData);
        return this.usersRepository.save(newUser); // Guarda el nuevo usuario en la base de datos
    }

    async findByEmail(email: string): Promise<User | undefined> {
        return this.usersRepository.findOne({ where: { email } });
    }

    // Actualizar usuario
    async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<{ message: string; data: SanitizedUserDto }> {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado.');
        }

        // Ignorar los campos que sean `undefined`
        for (const [key, value] of Object.entries(updateUserDto)) {
            if (value !== undefined) {
                user[key] = value;
            }
        }

        const updatedUser = await this.usersRepository.save(user);

        const sanitizedUser = plainToInstance(SanitizedUserDto, updatedUser, { excludeExtraneousValues: true });

        return {
            message: 'Usuario actualizado correctamente.',
            data: sanitizedUser,
        };
    }

    // Soft delete usuario
    async softDeleteUser(id: number): Promise<{ message: string }> {
        const user = await this.usersRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado.');
        }

        // Verificar si el usuario ya está eliminado
        if (user.status === UserStatus.DELETED) {
            return { message: 'Este usuario ya ha sido eliminado previamente.' };
        }

        // Cambiar el estado del usuario a "deleted"
        user.status = UserStatus.DELETED;
        await this.usersRepository.save(user);

        return { message: 'Usuario eliminado correctamente.' };
    }

    // Listar todos los usuarios
    async getAllUsers(): Promise<{ message: string; data: SanitizedUserDto[] }> {
        const users = await this.usersRepository.find();

        // Transformar los usuarios para excluir campos sensibles
        const sanitizedUsers = plainToInstance(SanitizedUserDto, users, { excludeExtraneousValues: true });

        return {
            message: 'Lista de usuarios obtenida correctamente.',
            data: sanitizedUsers,
        };
    }

    // Obtener usuario por ID
    async getUserById(id: number): Promise<{ message: string; data: any }> {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado.');
        }

        // usuario sin campos sensibles
        const sanitizedUser = plainToInstance(SanitizedUserDto, user, { excludeExtraneousValues: true });

        return {
            message: 'Usuario encontrado correctamente.',
            data: sanitizedUser,
        };
    }
}
