import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Role } from 'src/roles/role.entity';
import { Transaction } from '@src/transactions/transaction.entity';

export enum UserStatus {
    PENDING = 'pendiente',
    ACTIVE = 'activo',
    SUSPENDED = 'suspendido',
    DELETED = 'eliminado'
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

    @Column({ type: 'varchar', default: 'noNameAsigned' })
    name: string;

    @Column({ type: 'varchar', default: 'undefinedLastName' })
    lastName: string;

    @Column({ default: false })
    isConfirmed: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @ManyToOne(() => Role, (role) => role.users) // Relación muchos a uno: muchos usuarios, un solo rol
    role: Role;

    @OneToMany(() => Transaction, (transaction) => transaction.user)
    transactions: Transaction[];

    @Column({ nullable: true })
    otpCode: string;

    @Column({ type: 'timestamp', nullable: true })
    otpExpiration: Date;

    @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
    status: UserStatus;
}
