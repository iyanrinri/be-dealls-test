import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('payroll_periods')
export class PayrollPeriod {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'date', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'date', name: 'end_date' })

  endDate: Date;

  @Column()
  status: string;

  @Column({ type: 'bigint', name: 'created_by' })
  createdBy: number;

  @Column({ type: 'bigint', name: 'updated_by' })
  updatedBy?: number;

  @Column({ type: 'varchar', name: 'ip_address' })
  ipAddress?: string;
}
