import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { ReimbursementService } from './reimbursement.service';
import { CreateReimbursementDto } from './dto/create-reimbursement.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ReqUser } from '../common/decorators/req-user.decorator';

@Controller('reimbursements')
export class ReimbursementController {
  constructor(private readonly reimbursementService: ReimbursementService) {}

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth()
  async create(
    @Body() createReimbursementDto: CreateReimbursementDto,
    @ReqUser() reqUser: any,
  ) {
    const result = await this.reimbursementService.create(createReimbursementDto, reqUser);
    return { message: 'Reimbursement created', data: result };
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get()
  async findAll(@ReqUser() reqUser: any) {
    const result = await this.reimbursementService.findAll(reqUser);
    return { message: 'Reimbursement list', data: result };
  }
}
