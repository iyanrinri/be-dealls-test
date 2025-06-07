import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Reimbursement } from './entities/reimbursement.entity';
import { CreateReimbursementDto } from './dto/create-reimbursement.dto';
import { UserPayload } from '../auth/interfaces/user-payload.interface';
import { AttendancePeriod } from '../attendances/entities/attendance-period.entity';

@Injectable()
export class ReimbursementService {
  constructor(
    @InjectRepository(Reimbursement)
    private readonly reimbursementRepository: Repository<Reimbursement>,
    @InjectRepository(AttendancePeriod)
    private attendancePeriodRepository: Repository<AttendancePeriod>,
  ) {}

  async create(
    createReimbursementDto: CreateReimbursementDto,
    user: UserPayload,
  ): Promise<Reimbursement> {
    if (user.role !== 'employee') {
      throw new Error('Only employees can submit reimbursements');
    }
    const date = new Date();
    const period = await this.attendancePeriodRepository.findOne({
      where: {
        startDate: LessThanOrEqual(date),
        endDate: MoreThanOrEqual(date),
      },
    });

    if (!period) {
      throw new BadRequestException(
        'Admin has not created an attendance period',
      );
    }
    const userId = user.id;
    const reimbursement = this.reimbursementRepository.create({
      ...createReimbursementDto,
      attendancePeriodId: parseInt(period.id),
      userId,
      ipAddress: user.ip_address,
      createdBy: user.id,
      updatedBy: user.id,
    });
    return this.reimbursementRepository.save(reimbursement);
  }
}
