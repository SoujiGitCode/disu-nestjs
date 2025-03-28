import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseTokenController } from './firebase-token.controller';
import { FirebaseTokenService } from './firebase-token.service';

describe('FirebaseTokenController', () => {
  let controller: FirebaseTokenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FirebaseTokenController],
      providers: [FirebaseTokenService],
    }).compile();

    controller = module.get<FirebaseTokenController>(FirebaseTokenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
