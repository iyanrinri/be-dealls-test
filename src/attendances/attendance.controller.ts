import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendancePeriodDto } from './dto/create-attendance-period.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReqUser } from '../common/decorators/req-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('attendance-periods')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async listAttendancePeriods(@ReqUser() reqUser: any) {
    const result = await this.attendanceService.listAttendancePeriods();
    return { message: 'Attendance periods list', data: result };
  }

  @UseGuards(AdminGuard)
  @Post('attendance-period')
  @ApiBearerAuth()
  async createAttendancePeriod(
    @ReqUser() reqUser: any,
    @Body() createAttendancePeriodDto: CreateAttendancePeriodDto,
  ) {
    const result = await this.attendanceService.createAttendancePeriod(
      createAttendancePeriodDto,
      reqUser,
    );
    return { message: 'Attendance period created', data: result };
  }

  @Post('check')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async submitAttendance(@ReqUser() reqUser: any) {
    const result = await this.attendanceService.submitAttendance(reqUser);
    return { message: 'Attendance submitted', data: result };
  }

  @Get('list')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiQuery({
    name: 'attendancePeriodId',
    type: String,
    required: false,
    description: 'The ID of the attendance period (optional)',
  })
  async listAttendance(
    @ReqUser() reqUser: any,
    @Query('attendancePeriodId') attendancePeriodId?: string,
  ) {
    const result = await this.attendanceService.listAttendance(
      reqUser,
      attendancePeriodId,
    );
    return { message: 'Attendance list', data: result };
  }
}
