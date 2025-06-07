import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditLog } from './entities/audit-log.entity';
import { User } from '../users/entities/user.entity';
import { ApiBearerAuth, ApiQuery} from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiQuery({
      name: 'employeeId',
      type: String,
      required: false,
      description: 'The ID of the employee[user] (optional)',
  })
  @ApiQuery({
      name: 'startDate',
      type: String,
      required: false,
      description: 'YYYY-MM-DD HH:ii:ss format for the start date (optional)',
  })
  @ApiQuery({
      name: 'endDate',
      type: String,
      required: false,
      description: 'YYYY-MM-DD HH:ii:ss format for the end date (optional)',
  })
  async findAll(
    @Query('employeeId') employeeId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<AuditLog[]> {
    return this.auditLogService.findAllWithUser({ employeeId, startDate, endDate });
  }
}
