import { Test, TestingModule } from '@nestjs/testing';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { RunPayrollDto } from './dto/run-payroll.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('PayrollController', () => {
  let controller: PayrollController;
  let payrollService: PayrollService;

  const mockPayrollService = {
    runPayroll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayrollController],
      providers: [
        { provide: PayrollService, useValue: mockPayrollService },
      ],
    })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<PayrollController>(PayrollController);
    payrollService = module.get<PayrollService>(PayrollService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('runPayroll', () => {
    it('should return unauthorized if user is not present', async () => {
      const req: any = { user: null };
      const dto: RunPayrollDto = { attendancePeriodId: '1' } as any;
      const result = await controller.runPayroll(req, dto);
      expect(result).toEqual({ message: 'Unauthorized' });
    });

    it('should call payrollService.runPayroll and return result', async () => {
      const req: any = { user: { id: 1 } };
      const dto: RunPayrollDto = { attendancePeriodId: '1' } as any;
      const mockResult = { payroll: 'data' };
      mockPayrollService.runPayroll.mockResolvedValueOnce(mockResult);
      const result = await controller.runPayroll(req, dto);
      expect(mockPayrollService.runPayroll).toHaveBeenCalledWith(req.user, '1');
      expect(result).toEqual({ message: 'Payroll processed', result: mockResult });
    });

    it('should throw HttpException on error', async () => {
      const req: any = { user: { id: 1 } };
      const dto: RunPayrollDto = { attendancePeriodId: '1' } as any;
      const error = new HttpException('error', 500);
      mockPayrollService.runPayroll.mockRejectedValue(error);
      await expect(controller.runPayroll(req, dto)).rejects.toThrow(HttpException);
      await expect(controller.runPayroll(req, dto)).rejects.toThrow('error');
    });
  });
});
