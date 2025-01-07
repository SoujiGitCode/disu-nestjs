import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

    @Column({ type: 'varchar', length: 100, nullable: true })
    industry?: string; // Rubro en inglés

    @Column({ type: 'text', nullable: true })
    address?: string;

    @Column({ type: 'float', nullable: true })
    discount?: number;

    @Column({ type: 'simple-array', nullable: true })
    paymentMethods?: string[]; // Array para los métodos de pago

    @Column({ type: 'varchar', length: 255, nullable: true })
    notificationsEmailAddress?: string; // Email para notificaciones opcional

    @Column({ type: 'varchar', length: 255, nullable: true })
    logoUrl?: string; // URL del logo del negocio

    @Column({ type: 'simple-array', nullable: true })
    imageUrls?: string[]; // Array de URLs para las imágenes adicionales

    @Column({ type: 'time', nullable: true })
    openingHour?: string; // Hora de apertura

    @Column({ type: 'time', nullable: true })
    closingHour?: string; // Hora de cierre

    @Column({ type: 'simple-array', nullable: true })
    openingDays?: string[]; // Array para los días de apertura

}
