import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('attendance_periods')
export class AttendancePeriod {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'date', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'date', name: 'end_date' })
  endDate: Date;

  @Column({ type: 'varchar', nullable: true })
  status?: string;

  @Column({ type: 'timestamp with time zone', name: 'processed_at' })
  processedAt: Date;

  @Column({ type: 'bigint', name: 'created_by' })
  createdBy: number;

  @Column({ type: 'bigint', name: 'updated_by' })
  updatedBy?: number;

  @Column({ type: 'varchar', name: 'ip_address' })
  ipAddress?: string;
}
