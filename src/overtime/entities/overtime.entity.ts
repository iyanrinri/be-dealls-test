import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('overtimes')
export class Overtime {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', name: 'user_id' })
  userId: number;

  @Column({ type: 'bigint', name: 'attendance_period_id' })
  attendancePeriodId: number;

  @Column({ type: 'date', name: 'overtime_date' })
  overtimeDate: Date;

  @Column({ type: 'float', name: 'hours' })
  hours: number;

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
