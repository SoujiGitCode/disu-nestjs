import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseTokenService } from './firebase-token.service';

describe('FirebaseTokenService', () => {
  let service: FirebaseTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FirebaseTokenService],
    }).compile();

    service = module.get<FirebaseTokenService>(FirebaseTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
