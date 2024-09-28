import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Role } from 'src/roles/role.entity';

export enum UserStatus {
    PENDING = 'pendiente',
    ACTIVE = 'activo',
    SUSPENDED = 'suspendido',
}


export enum Gender {
    HOMBRE = 'hombre',
    MUJER = 'mujer',
    INDEFINIDO = 'indefinido',
}


@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ type: 'date' })
    birthdate: Date;


    @Column()
    gender: string;

    @Column({ default: false })
    isConfirmed: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @ManyToOne(() => Role, (role) => role.users) // Relación muchos a uno: muchos usuarios, un solo rol
    role: Role;

    @Column({ nullable: true })
    otpCode: string;

    @Column({ type: 'timestamp', nullable: true })
    otpExpiration: Date;

    @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
    status: UserStatus;
}
