import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findOneByUsername: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user object (without password) when credentials are valid', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        password: 'hashedPassword',
        role: 'employee',
      };

      mockUsersService.findOneByUsername.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('testuser', 'password123');
      
      expect(mockUsersService.findOneByUsername).toHaveBeenCalledWith('testuser');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(result).toEqual({
        id: 1,
        username: 'testuser',
        role: 'employee',
      });
    });

    it('should return null when user does not exist', async () => {
      mockUsersService.findOneByUsername.mockResolvedValue(null);

      const result = await service.validateUser('nonexistentuser', 'password');
      
      expect(mockUsersService.findOneByUsername).toHaveBeenCalledWith('nonexistentuser');
      expect(result).toBeNull();
    });

    it('should return null when password is incorrect', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        password: 'hashedPassword',
        role: 'employee',
      };

      mockUsersService.findOneByUsername.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('testuser', 'wrongpassword');
      
      expect(mockUsersService.findOneByUsername).toHaveBeenCalledWith('testuser');
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedPassword');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should generate and return JWT token', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        role: 'employee',
      };

      const token = 'jwt-token';
      mockJwtService.sign.mockReturnValue(token);

      const result = await service.login(user);
      
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        id: 1,
        username: 'testuser',
        role: 'employee',
      });
      expect(result).toEqual({ access_token: token });
    });
  });
});
