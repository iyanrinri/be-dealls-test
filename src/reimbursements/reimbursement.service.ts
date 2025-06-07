import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Reimbursement } from './entities/reimbursement.entity';
import { CreateReimbursementDto } from './dto/create-reimbursement.dto';
import { UserPayload } from '../auth/interfaces/user-payload.interface';
import { AttendancePeriod } from '../attendances/entities/attendance-period.entity';
import { AuditLogService } from '../audit-logs/audit-log.service';

@Injectable()
export class ReimbursementService {
  constructor(
    @InjectRepository(Reimbursement)
    private readonly reimbursementRepository: Repository<Reimbursement>,
    @InjectRepository(AttendancePeriod)
    private attendancePeriodRepository: Repository<AttendancePeriod>,
    private auditLogService: AuditLogService,
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
      createdBy: user.id,
      updatedBy: user.id,
    });
    const savedReimbursement = await this.reimbursementRepository.save(reimbursement);
    await this.auditLogService.logAction(
      user,
      'create',
      'reimbursements',
      savedReimbursement.id.toString(),
      createReimbursementDto
    );
    return savedReimbursement;
  }

  async findAll(user: UserPayload, locale: string = 'en-US'): Promise<any[]> {
    if (!user) {
      throw new Error('Unauthorized');
    }
    const reimbursements = await this.reimbursementRepository.find({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
    return reimbursements.map((r: any) => ({
      ...r,
      user: r.user
        ? {
            id: r.user.id,
            username: r.user.username,
            role: r.user.role,
          }
        : undefined,
      createdAtFormatted: r.createdAt
        ? new Date(r.createdAt).toLocaleString(locale, {
            timeZone: 'Asia/Jakarta',
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : null,
    }));
  }
}
