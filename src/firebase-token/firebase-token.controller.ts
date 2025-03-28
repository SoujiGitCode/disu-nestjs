// src/firebase-token/firebase-token.controller.ts
import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
} from '@nestjs/common';
import { FirebaseTokenService } from './firebase-token.service';
import { CreateFirebaseTokenDto } from './dto/create-firebase-token.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('firebase-tokens')
@UseInterceptors(FileInterceptor(''))
export class FirebaseTokenController {
  constructor(private readonly firebaseTokenService: FirebaseTokenService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createOrUpdate(@Body() dto: CreateFirebaseTokenDto) {
    const { userId, token, platform } = dto;
    return this.firebaseTokenService.createOrUpdateToken(userId, token, platform);
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: number) {
    return this.firebaseTokenService.findByUserId(+userId);
  }

  @Get()
  async findAll() {
    return this.firebaseTokenService.findAll();
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.firebaseTokenService.delete(+id);
  }
}


function ApiConsumes(arg0: string): (target: typeof FirebaseTokenController) => void | typeof FirebaseTokenController {
  throw new Error('Function not implemented.');
}

