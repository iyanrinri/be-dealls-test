import { Test, TestingModule } from '@nestjs/testing';
import { OvertimeService } from './overtime.service';
import { UserPayload } from '../auth/interfaces/user-payload.interface';
import { AuditLogService } from '../audit-logs/audit-log.service';

const mockOvertimeRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};
const mockAttendanceRepository = {
  findOne: jest.fn(),
  manager: {
    getRepository: jest.fn(() => ({ findOne: jest.fn() })),
  },
};
const mockAuditLogService = { logAction: jest.fn() };

describe('OvertimeService', () => {
  let service: OvertimeService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OvertimeService,
        { provide: 'OvertimeRepository', useValue: mockOvertimeRepository },
        { provide: 'AttendanceRepository', useValue: mockAttendanceRepository },
        { provide: 'AttendancePeriodRepository', useValue: { findOne: jest.fn() } },
        { provide: AuditLogService, useValue: mockAuditLogService },
      ],
    })
      .overrideProvider('OvertimeRepository')
      .useValue(mockOvertimeRepository)
      .overrideProvider('AttendanceRepository')
      .useValue(mockAttendanceRepository)
      .compile();
    service = module.get<OvertimeService>(OvertimeService);
    (service as any).overtimeRepository = mockOvertimeRepository;
    (service as any).attendanceRepository = mockAttendanceRepository;
  });

  describe('listOvertime', () => {
    it('should return overtime list for current user and period', async () => {
      const user: UserPayload = { id: 1, username: 'employee', role: 'employee' };
      const periodId = '2';
      const expectedList = [
        { id: 1, userId: 1, attendancePeriodId: 2, overtimeDate: new Date(), hours: 2, overtimeDateFormatted: expect.any(String), user: undefined },
      ];
      mockOvertimeRepository.find.mockResolvedValue(expectedList);
      const result = await service.listOvertime(user, periodId);
      expect(mockOvertimeRepository.find).toHaveBeenCalledWith({
        where: { userId: user.id, attendancePeriodId: parseInt(periodId) },
        order: { overtimeDate: 'ASC' },
        relations: ['user'],
      });
      expect(result).toEqual(expectedList);
    });
  });
});
