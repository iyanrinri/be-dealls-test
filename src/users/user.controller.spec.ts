import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UsersService } from './user.service';
import { HttpException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

jest.mock('@nestjs/jwt');
jest.mock('@nestjs/config');

describe('UserController', () => {
  let controller: UserController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {},
        },
        Reflector,
        ConfigService,
      ],
      imports: [],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UserController>(UserController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('getUserInfo', () => {
    it('should return unauthorized if user is not present', async () => {
      const req: any = { user: null };
      await expect(controller.getUserInfo(req)).rejects.toThrow(HttpException);
    });
    it('should throw NotFoundException if user not found', async () => {
      (usersService.findOne as jest.Mock).mockResolvedValueOnce(null);
      const req: any = { user: { id: 1 } };
      await expect(controller.getUserInfo(req)).rejects.toThrow(NotFoundException);
    });

    it('should return frontend-friendly user info if found', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        role: 'employee',
        salary: '1000000.00',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (usersService.findOne as jest.Mock).mockResolvedValueOnce(user);
      const req: any = { user: { id: 1 } };
      const result = await controller.getUserInfo(req);
      expect(result).toEqual({
        message: 'User info',
        data: {
          id: user.id,
          username: user.username,
          role: user.role,
          salary: user.salary,
        },
      });
    });
  });
});
