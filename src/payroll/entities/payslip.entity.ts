import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AttendancePeriod } from '../../attendances/entities/attendance-period.entity';

@Entity('payslips')
export class Payslip {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'integer' })
  userId: number;

  @Column({ name: 'attendance_period_id', type: 'integer' })
  attendancePeriodId: number;

  @Column({ name: 'base_salary', type: 'decimal', precision: 10, scale: 2 })
  baseSalary: string;

  @Column({ name: 'overtime_pay', type: 'decimal', precision: 10, scale: 2 })
  overtimePay: string;

  @Column({ name: 'reimbursement_total', type: 'decimal', precision: 10, scale: 2 })
  reimbursementTotal: string;

  @Column({ name: 'total_take_home', type: 'decimal', precision: 10, scale: 2 })
  totalTakeHome: string;

  @Column({ name: 'working_days', type: 'integer', nullable: true })
  workingDays?: number;

  @Column({ name: 'salary_per_hour', type: 'decimal', precision: 10, scale: 2, nullable: true })
  salaryPerHour?: string;

  @Column({ name: 'attendance_count', type: 'integer', nullable: true })
  attendanceCount?: number;

  @Column({ name: 'overtime_unit_percentage', type: 'float', nullable: true })
  overtimeUnitPercentage?: number;

  @Column({ name: 'overtime_value', type: 'decimal', precision: 10, scale: 2, nullable: true })
  overtimeValue?: string;

  @Column({ name: 'salary_base_attendance_count', type:  'decimal', precision: 10, scale: 2, nullable: true })
  salaryBaseAttendanceCount?: string;

  @Column({ name: 'performance_attendance', type: 'decimal', precision: 10, scale: 2, nullable: true })
  performanceAttendance?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => AttendancePeriod)
  @JoinColumn({ name: 'attendance_period_id' })
  attendancePeriod: AttendancePeriod;

  @Column({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt?: Date;

  @Column({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt?: Date;

  @Column({ type: 'bigint', name: 'created_by' })
  createdBy?: number;

  @Column({ type: 'bigint', name: 'updated_by' })
  updatedBy?: number;

  @Column({ type: 'varchar', name: 'ip_address', nullable: true })
  ipAddress?: string;
}
