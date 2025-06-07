import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let usersService: UsersService;
  let mockUserRepository;

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    usersService = moduleRef.get<UsersService>(UsersService);
  });

  describe('findOneByUsername', () => {
    it('should return a user if found', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        role: 'employee',
        salary: 5000,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      expect(await usersService.findOneByUsername('testuser')).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      expect(await usersService.findOneByUsername('nonexistent')).toBeNull();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'nonexistent' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a user if found by id', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        role: 'employee',
        salary: 5000,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      expect(await usersService.findOne(1)).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return null if user not found by id', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      expect(await usersService.findOne(999)).toBeNull();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });
  });

  it('service should be defined', () => {
    expect(usersService).toBeDefined();
  });
});
