import { Test, TestingModule } from '@nestjs/testing';
import { ReimbursementService } from './reimbursement.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reimbursement } from './entities/reimbursement.entity';
import { AttendancePeriod } from '../attendances/entities/attendance-period.entity';
import { Repository } from 'typeorm';
import { AuditLogService } from '../audit-logs/audit-log.service';

const mockUser = { id: 1, username: 'employee', role: 'employee' };
const mockReimbursement = {
  id: 1,
  amount: 100000,
  description: 'Transport',
  user: mockUser,
  created_at: new Date(),
  updated_at: new Date(),
};
const mockPeriod = { id: '1', startDate: new Date(), endDate: new Date() };
const mockAuditLogService = { logAction: jest.fn() };

describe('ReimbursementService', () => {
  let service: ReimbursementService;
  let repo: Repository<Reimbursement>;
  let periodRepo: Repository<AttendancePeriod>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReimbursementService,
        {
          provide: getRepositoryToken(Reimbursement),
          useValue: {
            create: jest.fn().mockReturnValue(mockReimbursement),
            save: jest.fn().mockResolvedValue(mockReimbursement),
          },
        },
        {
          provide: getRepositoryToken(AttendancePeriod),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockPeriod),
          },
        },
        { provide: AuditLogService, useValue: mockAuditLogService },
      ],
    }).compile();

    service = module.get<ReimbursementService>(ReimbursementService);
    repo = module.get<Repository<Reimbursement>>(getRepositoryToken(Reimbursement));
    periodRepo = module.get<Repository<AttendancePeriod>>(getRepositoryToken(AttendancePeriod));
  });

  it('should create and save a reimbursement', async () => {
    const dto = { amount: 100000, description: 'Transport' };
    const result = await service.create(dto, mockUser as any);
    expect(periodRepo.findOne).toHaveBeenCalled();
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result).toEqual(mockReimbursement);
  });
});