import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FirebaseToken } from './firebase-token.entity';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

@Injectable()
export class FirebaseTokenService {
  constructor(
    @InjectRepository(FirebaseToken)
    private tokenRepository: Repository<FirebaseToken>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createOrUpdateToken(userId: number, token: string, platform: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const existing = await this.tokenRepository.findOne({
      where: { platform, user: { id: userId } },
      relations: ['user'],
    });

    if (existing) {
      existing.token = token;
      await this.tokenRepository.save(existing);

      return {
        success: true,
        message: 'Token actualizado correctamente.',
        data: {
          id: existing.id,
          token: existing.token,
          platform: existing.platform,
        },
      };
    }

    const newToken = this.tokenRepository.create({ token, platform, user });
    const saved = await this.tokenRepository.save(newToken);

    return {
      success: true,
      message: 'Token registrado correctamente.',
      data: {
        id: saved.id,
        token: saved.token,
        platform: saved.platform,
      },
    };
  }

  async findByUserId(userId: number) {
    const tokens = await this.tokenRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    return {
      success: true,
      message: 'Tokens obtenidos correctamente.',
      data: tokens.map((t) => ({
        id: t.id,
        token: t.token,
        platform: t.platform,
      })),
    };
  }

  async findAll() {
    const tokens = await this.tokenRepository.find({ relations: ['user'] });

    return {
      success: true,
      message: 'Lista de tokens obtenida correctamente.',
      data: tokens.map((t) => ({
        id: t.id,
        token: t.token,
        platform: t.platform,
        userId: t.user.id,
      })),
    };
  }

  async delete(id: number) {
    const token = await this.tokenRepository.findOne({ where: { id } });

    if (!token) {
      throw new NotFoundException('Token no encontrado.');
    }

    await this.tokenRepository.remove(token);

    return {
      success: true,
      message: 'Token eliminado correctamente.',
      data: null,
    };
  }
}
