import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { AttendancePeriod } from './entities/attendance-period.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { CreateAttendancePeriodDto } from './dto/create-attendance-period.dto';
import { UserPayload } from '../auth/interfaces/user-payload.interface';
import { AuditLogService } from '../audit-logs/audit-log.service';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let attendancePeriodRepository: Repository<AttendancePeriod>;
  let attendanceRepository: Repository<Attendance>;

  const mockAttendancePeriodRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockAttendanceRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: getRepositoryToken(AttendancePeriod),
          useValue: mockAttendancePeriodRepository,
        },
        {
          provide: getRepositoryToken(Attendance),
          useValue: mockAttendanceRepository,
        },
        {
          provide: AuditLogService,
          useValue: { createAuditLog: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
    attendancePeriodRepository = module.get<Repository<AttendancePeriod>>(
      getRepositoryToken(AttendancePeriod),
    );
    attendanceRepository = module.get<Repository<Attendance>>(
      getRepositoryToken(Attendance),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAttendancePeriod', () => {
    it('should create a new attendance period successfully', async () => {
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

      const newPeriod = {
        id: 1,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: dto.status,
        createdBy: user.id,
        ipAddress: user.ip_address,
        updatedBy: user.id,
      };

      mockAttendancePeriodRepository.create.mockReturnValue(newPeriod);
      mockAttendancePeriodRepository.save.mockResolvedValue(newPeriod);

      const result = await service.createAttendancePeriod(dto, user);

      expect(mockAttendancePeriodRepository.create).toHaveBeenCalledWith({
        startDate: dto.startDate,
        endDate: dto.endDate,
        status: dto.status,
        createdBy: user.id,
        ipAddress: user.ip_address,
        updatedBy: user.id,
      });
      expect(mockAttendancePeriodRepository.save).toHaveBeenCalledWith(newPeriod);
      expect(result).toEqual(newPeriod);
    });

    it('should throw BadRequestException if end date is before start date', async () => {
      const dto: CreateAttendancePeriodDto = {
        startDate: '2025-06-30',
        endDate: '2025-06-01',
        status: 'open',
      };

      const user: UserPayload = {
        id: 1,
        username: 'admin',
        role: 'admin',
        ip_address: '127.0.0.1',
      };

      await expect(service.createAttendancePeriod(dto, user)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockAttendancePeriodRepository.create).not.toHaveBeenCalled();
      expect(mockAttendancePeriodRepository.save).not.toHaveBeenCalled();
    });

    it('should create a attendance period with default values if not provided', async () => {
      const dto: CreateAttendancePeriodDto = {
        startDate: '2025-06-01',
        endDate: '2025-06-30',
      };

      const user: UserPayload = {
        id: 1,
        username: 'admin',
        role: 'admin',
      };

      const newPeriod = {
        id: 1,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: undefined,
        createdBy: user.id,
        ipAddress: undefined,
        updatedBy: user.id,
      };

      mockAttendancePeriodRepository.create.mockReturnValue(newPeriod);
      mockAttendancePeriodRepository.save.mockResolvedValue(newPeriod);

      const result = await service.createAttendancePeriod(dto, user);

      expect(mockAttendancePeriodRepository.create).toHaveBeenCalledWith({
        startDate: dto.startDate,
        endDate: dto.endDate,
        status: undefined,
        createdBy: user.id,
        ipAddress: undefined,
        updatedBy: user.id,
      });
      expect(mockAttendancePeriodRepository.save).toHaveBeenCalledWith(newPeriod);
      expect(result).toEqual(newPeriod);
    });
  });

  // Uncomment below if you implement the submitAttendance method
  /*
  describe('submitAttendance', () => {
    it('should submit a new attendance successfully', async () => {
      // Test for submitAttendance method
    });

    it('should throw BadRequestException if attendance period does not exist', async () => {
      // Test for invalid attendance period
    });

    it('should throw BadRequestException if attendance date is outside attendance period', async () => {
      // Test for date outside period
    });

    it('should return existing attendance if already submitted for the same day', async () => {
      // Test for duplicate submission
    });
  });
  */
});
