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

  describe('listPayroll', () => {
    it('should return unauthorized if user is not present', async () => {
      const req: any = { user: null };
      const result = await controller.listPayroll(req, undefined, undefined);
      expect(result).toEqual({ message: 'Unauthorized' });
    });

    it('should call payrollService.listPayroll and return result', async () => {
      const req: any = { user: { id: 1 } };
      const mockResult = [{ id: 1, userId: 1, attendancePeriodId: 2 }];
      payrollService.listPayroll = jest.fn().mockResolvedValueOnce(mockResult);
      const result = await controller.listPayroll(req, '2', '1');
      expect(payrollService.listPayroll).toHaveBeenCalledWith({ attendancePeriodId: '2', employeeId: '1' });
      expect(result).toEqual({ message: 'Payroll list', result: mockResult });
    });

    it('should call payrollService.listPayroll with today if attendancePeriodId is not provided', async () => {
      const req: any = { user: { id: 1 } };
      const mockResult = [{ id: 1, userId: 1, attendancePeriodId: 2 }];
      payrollService.listPayroll = jest.fn().mockResolvedValueOnce(mockResult);
      const result = await controller.listPayroll(req, undefined, undefined);
      expect(payrollService.listPayroll).toHaveBeenCalledWith({ attendancePeriodId: undefined, employeeId: undefined });
      expect(result).toEqual({ message: 'Payroll list', result: mockResult });
    });

    it('should throw HttpException on error', async () => {
      const req: any = { user: { id: 1 } };
      const error = new HttpException('error', 500);
      payrollService.listPayroll = jest.fn().mockRejectedValue(error);
      await expect(controller.listPayroll(req, '2', '1')).rejects.toThrow(HttpException);
      await expect(controller.listPayroll(req, '2', '1')).rejects.toThrow('error');
    });
  });

  describe('getMyPayslip', () => {
    it('should return unauthorized if user is not present', async () => {
      const req: any = { user: null };
      const result = await controller.getMyPayslip(req, undefined);
      expect(result).toEqual({ message: 'Unauthorized' });
    });

    it('should return forbidden if user is not employee', async () => {
      const req: any = { user: { id: 1, role: 'admin' } };
      const result = await controller.getMyPayslip(req, undefined);
      expect(result).toEqual({ message: 'Forbidden' });
    });

    it('should call payrollService.getEmployeePayslip and return result', async () => {
      const req: any = { user: { id: 2, role: 'employee' } };
      const mockResult = { id: 1, userId: 2, attendancePeriodId: 3 };
      payrollService.getEmployeePayslip = jest.fn().mockResolvedValueOnce(mockResult);
      const result = await controller.getMyPayslip(req, '3');
      expect(payrollService.getEmployeePayslip).toHaveBeenCalledWith(2, '3');
      expect(result).toEqual({ message: 'Payslip breakdown', result: mockResult });
    });

    it('should throw HttpException on error', async () => {
      const req: any = { user: { id: 2, role: 'employee' } };
      const error = new HttpException('error', 500);
      payrollService.getEmployeePayslip = jest.fn().mockRejectedValue(error);
      await expect(controller.getMyPayslip(req, '3')).rejects.toThrow(HttpException);
      await expect(controller.getMyPayslip(req, '3')).rejects.toThrow('error');
    });
  });
});
