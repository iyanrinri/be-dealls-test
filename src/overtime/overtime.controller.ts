import { Controller, Post, Body, Req, UseGuards, Get, Query } from '@nestjs/common';
import { OvertimeService } from './overtime.service';
import { CreateOvertimeDto } from './dto/create-overtime.dto';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('overtime')
export class OvertimeController {
  constructor(private readonly overtimeService: OvertimeService) {}

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth()
  async submitOvertime(
    @Req() request: Request,
    @Body() dto: CreateOvertimeDto,
  ) {
    const reqUser = request.user ? request.user : null;
    if (!reqUser) {
      return { message: 'Unauthorized' };
    }
    return this.overtimeService.submitOvertime(dto, reqUser);
  }

  @UseGuards(AuthGuard)
  @Get('list')
  @ApiBearerAuth()
  @ApiQuery({
    name: 'attendancePeriodId',
    type: String,
    required: false,
    description: 'The ID of the attendance period (optional)',
  })
  async listOvertime(
    @Req() request: Request,
    @Query('attendancePeriodId') attendancePeriodId?: string,
  ) {
    const reqUser = request.user ? request.user : null;
    if (!reqUser) {
      return { message: 'Unauthorized' };
    }
    return this.overtimeService.listOvertime(reqUser, attendancePeriodId);
  }
}
