import { Test, TestingModule } from '@nestjs/testing';
import { PayrollService } from './payroll.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Payslip } from './entities/payslip.entity';
import { AttendancePeriod } from '../attendances/entities/attendance-period.entity';
import { Attendance } from '../attendances/entities/attendance.entity';
import { Overtime } from '../overtime/entities/overtime.entity';
import { Reimbursement } from '../reimbursements/entities/reimbursement.entity';
import { User } from '../users/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { AuditLogService } from '../audit-logs/audit-log.service';

describe('PayrollService', () => {
  let service: PayrollService;
  let payslipRepo: Repository<Payslip>;
  let periodRepo: Repository<AttendancePeriod>;
  let userRepo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollService,
        { provide: getRepositoryToken(Payslip), useClass: Repository },
        { provide: getRepositoryToken(AttendancePeriod), useClass: Repository },
        { provide: getRepositoryToken(Attendance), useClass: Repository },
        { provide: getRepositoryToken(Overtime), useClass: Repository },
        { provide: getRepositoryToken(Reimbursement), useClass: Repository },
        { provide: getRepositoryToken(User), useClass: Repository },
        { provide: DataSource, useValue: {} },
        { provide: AuditLogService, useValue: { logAction: jest.fn() } },
      ],
    }).compile();
    service = module.get<PayrollService>(PayrollService);
    payslipRepo = module.get(getRepositoryToken(Payslip));
    periodRepo = module.get(getRepositoryToken(AttendancePeriod));
    userRepo = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getEmployeePayslip', () => {
    it('should throw NotFoundException if period not found', async () => {
      jest.spyOn(service['periodRepo'], 'findOne').mockResolvedValueOnce(null);
      await expect(service.getEmployeePayslip(1, undefined)).rejects.toThrow('Attendance period not found');
    });

    it('should throw NotFoundException if payslip not found', async () => {
      jest.spyOn(service['periodRepo'], 'findOne').mockResolvedValueOnce({ id: '2' } as any);
      jest.spyOn(service['payslipRepo'], 'findOne').mockResolvedValueOnce(null);
      await expect(service.getEmployeePayslip(1, '2')).rejects.toThrow('Admin has not performed payroll for this period, pay slip is not ready yet');
    });

    it('should return payslip if found', async () => {
      jest.spyOn(service['periodRepo'], 'findOne').mockResolvedValueOnce({ id: '2' } as any);
      const payslip = { id: 1, userId: 1, attendancePeriodId: 2 };
      jest.spyOn(service['payslipRepo'], 'findOne').mockResolvedValueOnce(payslip as any);
      const result = await service.getEmployeePayslip(1, '2');
      expect(result).toEqual(payslip);
    });
  });
});
