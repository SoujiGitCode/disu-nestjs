"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
var typeorm_1 = require("typeorm");
var user_entity_1 = require("./src/users/user.entity");
var role_entity_1 = require("./src/roles/role.entity");
var permission_entity_1 = require("./src/permissions/permission.entity");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [user_entity_1.User, role_entity_1.Role, permission_entity_1.Permission], // Agrega todas tus entidades aquí
    migrations: ['src/migration/*.ts'], // Ruta donde estarán las migraciones
    synchronize: false, // Desactiva synchronize para usar migraciones
    logging: true,
});
