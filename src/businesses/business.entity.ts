import { Transaction } from '@src/transactions/transaction.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('businesses')
export class Business {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    representative?: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    slang?: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    description?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    industry?: string;

    @Column({ type: 'text', nullable: true })
    address?: string;

    @Column({ type: 'float', nullable: true })
    discount?: number;

    @Column({ type: 'simple-array', nullable: true })
    paymentMethods?: string[]; // Métodos de pago como array simple

    @Column({ type: 'varchar', length: 255, nullable: true })
    notificationsEmailAddress?: string;

    @Column({
        type: 'varchar',
        length: 20,
        default: 'active',
    })
    status: 'active' | 'inactive' | 'suspended'; // Posibles valores de estado

    @Column({ type: 'int', nullable: true })
    ranking?: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    logo?: string; // Cambiado de logoUrl a logo

    @Column({ type: 'jsonb', nullable: true })
    images?: {
        image1?: string;
        image2?: string;
        image3?: string;
        image4?: string;
        instagram?: string;
    };

    @Column({ type: 'varchar', length: 255, nullable: true })
    googleMapsUrl?: string;

    @Column({ type: 'jsonb', nullable: true })
    weeklySchedule?: Array<{
        day: string;
        status: string;
        openingHour: string | null;
        closingHour: string | null;
    }>; // JSON con horarios semanales

    @OneToMany(() => Transaction, (transaction) => transaction.business)
    transactions: Transaction[];

}