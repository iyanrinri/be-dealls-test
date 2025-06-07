import { Test, TestingModule } from '@nestjs/testing';
import { OvertimeController } from './overtime.controller';
import { OvertimeService } from './overtime.service';
import { CreateOvertimeDto } from './dto/create-overtime.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UserPayload } from '../auth/interfaces/user-payload.interface';
import { HttpException } from '@nestjs/common';

describe('OvertimeController', () => {
  let controller: OvertimeController;
  let overtimeService: OvertimeService;

  const mockOvertimeService = {
    submitOvertime: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OvertimeController],
      providers: [
        {
          provide: OvertimeService,
          useValue: mockOvertimeService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<OvertimeController>(OvertimeController);
    overtimeService = module.get<OvertimeService>(OvertimeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('submitOvertime', () => {
    it('should submit overtime for employee', async () => {
      const user: UserPayload = {
        id: 3,
        username: 'employee1',
        role: 'employee',
        ip_address: '127.0.0.3',
      };
      const dto: CreateOvertimeDto = {
        hours: 2.5,
      };
      const mockRequest = { user };
      const expectedResult = {
        id: 1,
        userId: user.id,
        overtimeDate: expect.any(Date),
        hours: dto.hours,
        reason: null,
        createdBy: user.id,
        ipAddress: user.ip_address,
      };
      mockOvertimeService.submitOvertime.mockResolvedValue(expectedResult);
      const error = new HttpException('Unauthorized', 401);
      mockOvertimeService.submitOvertime = jest.fn().mockRejectedValue(error);
      await expect(controller.submitOvertime(mockRequest as any, dto)).rejects.toThrow(HttpException);
    });

    it('should return unauthorized message if no user in request', async () => {
      const dto: CreateOvertimeDto = {
        hours: 2,
      };
      const mockRequest = { user: null };
      mockOvertimeService.submitOvertime.mockClear();
      const error = new HttpException('Unauthorized', 401);
      mockOvertimeService.submitOvertime = jest.fn().mockRejectedValue(error);
      await expect(controller.submitOvertime(mockRequest as any, dto)).rejects.toThrow(HttpException);
    });
  });

  describe('listOvertime', () => {
    it('should return overtime list for current user', async () => {
      const user: UserPayload = {
        id: 4,
        username: 'employee2',
        role: 'employee',
        ip_address: '127.0.0.4',
      };
      const attendancePeriodId = '7';
      const mockRequest = { user };
      const expectedList = [
        {
          id: 101,
          userId: user.id,
          attendancePeriodId: 7,
          overtimeDate: new Date('2025-06-07'),
          hours: 2,
          createdBy: user.id,
          ipAddress: user.ip_address,
        },
      ];
      overtimeService.listOvertime = jest.fn().mockResolvedValue(expectedList);
      const result = await controller.listOvertime(mockRequest as any, attendancePeriodId);
      expect(result).toEqual({ message: 'Overtime list', data: expectedList });
    });

    it('should return unauthorized message if no user in request', async () => {
      const mockRequest = { user: null };
      overtimeService.listOvertime = jest.fn();
      const error = new HttpException('Unauthorized', 401);
      overtimeService.listOvertime = jest.fn().mockRejectedValue(error);
      await expect(controller.listOvertime(mockRequest as any, '7')).rejects.toThrow(HttpException);
    });
  });
});
