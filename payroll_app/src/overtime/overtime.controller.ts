import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { OvertimeService } from './overtime.service';
import { CreateOvertimeDto } from './dto/create-overtime.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
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
}
