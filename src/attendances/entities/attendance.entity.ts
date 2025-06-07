import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AttendancePeriod } from './attendance-period.entity';
import { User } from '../../users/entities/user.entity';

@Entity('attendances')
export class Attendance {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'bigint', name: 'user_id' })
  userId: number;

  @Column({ type: 'bigint', name: 'attendance_period_id' })
  attendancePeriodId: number;

  @Column({ type: 'date', name: 'attendance_date' })
  attendanceDate: Date;

  @Column({ type: 'timestamp with time zone', name: 'clock_in_time' })
  clockInTime?: Date;

  @Column({ type: 'timestamp with time zone', name: 'clock_out_time' })
  clockOutTime?: Date;

  @Column({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt?: Date;

  @Column({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt?: Date;

  @Column({ type: 'bigint', name: 'created_by' })
  createdBy: number;

  @Column({ type: 'bigint', name: 'updated_by' })
  updatedBy?: number;

  @ManyToOne(() => AttendancePeriod)
  @JoinColumn({ name: 'attendance_period_id' })
  attendancePeriod?: AttendancePeriod;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;
}