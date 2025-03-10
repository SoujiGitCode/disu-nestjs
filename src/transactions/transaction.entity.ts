import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Business } from '../businesses/business.entity';

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.transactions, { eager: true })
    user: User;

    @ManyToOne(() => Business, (business) => business.transactions, { eager: true })
    business: Business;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    initAmount: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    finalAmount: number;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    discountPercentage: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
