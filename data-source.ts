import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './src/users/user.entity';
import { Role } from './src/roles/role.entity';
import { Permission } from './src/permissions/permission.entity';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [User, Role, Permission],  // Agrega todas tus entidades aquí
    migrations: ['src/migration/*.ts'],   // Ruta donde estarán las migraciones
    synchronize: false,  // Desactiva synchronize para usar migraciones
    logging: true,
});
