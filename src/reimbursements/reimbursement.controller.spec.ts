import { Test, TestingModule } from '@nestjs/testing';
import { ReimbursementController } from './reimbursement.controller';
import { ReimbursementService } from './reimbursement.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Request } from 'express';

const mockUser = { id: 1, username: 'employee', role: 'employee' };
const mockReimbursement = {
  id: 1,
  amount: 100000,
  description: 'Transport',
  user: mockUser,
  created_at: new Date(),
  updated_at: new Date(),
};

describe('ReimbursementController', () => {
  let controller: ReimbursementController;
  let service: ReimbursementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReimbursementController],
      providers: [
        {
          provide: ReimbursementService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockReimbursement),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ReimbursementController>(ReimbursementController);
    service = module.get<ReimbursementService>(ReimbursementService);
  });

  it('should create a reimbursement', async () => {
    const dto = { amount: 100000, description: 'Transport' };
    const req = { user: mockUser } as unknown as Request;
    const result = await controller.create(dto, req);
    expect(result).toEqual(mockReimbursement);
    expect(service.create).toHaveBeenCalledWith(dto, mockUser);
  });
});
