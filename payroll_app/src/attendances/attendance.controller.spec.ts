import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { CreateAttendancePeriodDto } from './dto/create-attendance-period.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UserPayload } from '../auth/interfaces/user-payload.interface';

describe('AttendanceController', () => {
  let controller: AttendanceController;
  let attendanceService: AttendanceService;

  const mockAttendanceService = {
    createAttendancePeriod: jest.fn(),
    submitAttendance: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceController],
      providers: [
        {
          provide: AttendanceService,
          useValue: mockAttendanceService,
        },
      ],
    })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AttendanceController>(AttendanceController);
    attendanceService = module.get<AttendanceService>(AttendanceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createAttendancePeriod', () => {
    it('should create a new attandace period', async () => {
      const dto: CreateAttendancePeriodDto = {
        startDate: '2025-06-01',
        endDate: '2025-06-30',
        status: 'open',
      };

      const user: UserPayload = {
        id: 1,
        username: 'admin',
        role: 'admin',
        ip_address: '127.0.0.1',
      };

      const mockRequest = {
        user,
      };

      const expectedResult = {
        id: 1,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: dto.status,
      };

      mockAttendanceService.createAttendancePeriod.mockResolvedValue(expectedResult);

      const result = await controller.createAttendancePeriod(mockRequest as any, dto);

      expect(mockAttendanceService.createAttendancePeriod).toHaveBeenCalledWith(
        dto,
        user,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should return unauthorized message if no user in request', async () => {
      const dto: CreateAttendancePeriodDto = {
        startDate: '2025-06-01',
        endDate: '2025-06-30',
        status: 'open',
      };

      const mockRequest = {
        user: null,
      };

      const result = await controller.createAttendancePeriod(mockRequest as any, dto);

      expect(mockAttendanceService.createAttendancePeriod).not.toHaveBeenCalled();
      expect(result).toEqual({ message: 'Unauthorized' });
    });
  });

  describe('submitAttendance', () => {
    it('should submit a new attendance', async () => {
      const user: UserPayload = {
        id: 2,
        username: 'employee',
        role: 'employee',
        ip_address: '127.0.0.2',
      };
      const mockRequest = { user };
      const expectedAttendance = {
        id: 10,
        userId: user.id,
        attendancePeriodId: 1,
        attendanceDate: new Date('2025-06-06'),
        clockInTime: new Date('2025-06-06T08:00:00Z'),
        clockOutTime: undefined,
        createdBy: user.id,
        ipAddress: user.ip_address,
        updatedBy: user.id,
      };
      mockAttendanceService.submitAttendance = jest.fn().mockResolvedValue(expectedAttendance);
      const result = await controller.submitAttendance(mockRequest as any);
      expect(mockAttendanceService.submitAttendance).toHaveBeenCalledWith(user);
      expect(result).toEqual(expectedAttendance);
    });

    it('should return unauthorized message if no user in request', async () => {
      const mockRequest = { user: null };
      mockAttendanceService.submitAttendance = jest.fn();
      const result = await controller.submitAttendance(mockRequest as any);
      expect(mockAttendanceService.submitAttendance).not.toHaveBeenCalled();
      expect(result).toEqual({ message: 'Unauthorized' });
    });
  });
});
