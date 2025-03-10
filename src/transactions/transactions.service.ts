import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { User } from '../users/user.entity';
import { Business } from '../businesses/business.entity';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transaction)
        private transactionsRepository: Repository<Transaction>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Business)
        private businessesRepository: Repository<Business>,
    ) { }

    async findOne(id: number): Promise<Partial<Transaction>> {
        const transaction = await this.transactionsRepository.findOne({ where: { id } });

        if (!transaction) {
            throw new NotFoundException(`Transacción con ID ${id} no encontrada.`);
        }

        // Retornar solo los campos de transactions (sin user ni business)
        return {
            id: transaction.id,
            initAmount: transaction.initAmount,
            finalAmount: transaction.finalAmount,
            discountPercentage: transaction.discountPercentage,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt,
        };
    }

    async create(createTransactionDto: CreateTransactionDto): Promise<Partial<Transaction>> {
        const { userId, businessId, initAmount, finalAmount, discountPercentage } = createTransactionDto;

        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('Usuario no encontrado.');

        const business = await this.businessesRepository.findOne({ where: { id: businessId } });
        if (!business) throw new NotFoundException('Negocio no encontrado.');

        const transaction = this.transactionsRepository.create({
            user,
            business,
            initAmount,
            finalAmount,
            discountPercentage,
        });

        const savedTransaction = await this.transactionsRepository.save(transaction);

        return {
            id: savedTransaction.id,
            initAmount: savedTransaction.initAmount,
            finalAmount: savedTransaction.finalAmount,
            discountPercentage: savedTransaction.discountPercentage,
            createdAt: savedTransaction.createdAt,
            updatedAt: savedTransaction.updatedAt,
        };
    }

    async findAll(): Promise<Partial<Transaction>[]> {
        const transactions = await this.transactionsRepository.find();

        return transactions.map((transaction) => ({
            id: transaction.id,
            initAmount: transaction.initAmount,
            finalAmount: transaction.finalAmount,
            discountPercentage: transaction.discountPercentage,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt,
        }));
    }

    async delete(id: number): Promise<{ success: boolean; message: string }> {
        const transaction = await this.transactionsRepository.findOne({ where: { id } });

        if (!transaction) {
            throw new NotFoundException(`Transacción con ID ${id} no encontrada.`);
        }

        try {
            await this.transactionsRepository.delete(id);
            return {
                success: true,
                message: 'Transacción eliminada exitosamente.',
            };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            throw new BadRequestException('Error al eliminar la transacción.');
        }
    }
}
