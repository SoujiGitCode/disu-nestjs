import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity';

@Injectable()
export class RolesService implements OnModuleInit {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
    ) { }

    // Se ejecutará automáticamente al iniciar el módulo
    async onModuleInit() {
        await this.initializeRoles();
    }

    // Método para insertar roles predeterminados
    private async initializeRoles() {
        const roles = await this.roleRepository.find();
        if (roles.length === 0) {
            await this.roleRepository.save([
                { id: 1, name: 'customer' },
                { id: 2, name: 'company' },
            ]);
        }
    }
}
