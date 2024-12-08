import { Controller, Post, Get, Body, Query, UseInterceptors, Delete, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { BadRequestException } from '@nestjs/common';

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
}
