import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '@src/users/user.entity';

@Entity('roles')  // El nombre de la tabla será 'roles'
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @OneToMany(() => User, (user) => user.role)  // Relación uno a muchos: un rol, muchos usuarios
    users: User[];
}
