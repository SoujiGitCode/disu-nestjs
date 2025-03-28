import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirebaseTokenService } from './firebase-token.service';
import { FirebaseTokenController } from './firebase-token.controller';
import { FirebaseToken } from './firebase-token.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FirebaseToken, User])],
  controllers: [FirebaseTokenController],
  providers: [FirebaseTokenService],
})
export class FirebaseTokenModule {}
