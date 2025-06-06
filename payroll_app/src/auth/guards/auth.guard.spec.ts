import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflector: Reflector;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    reflector = module.get<Reflector>(Reflector);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if public route is set', async () => {
      const context = createMockExecutionContext({});
      
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
      
      expect(await guard.canActivate(context)).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if no authorization header', async () => {
      const context = createMockExecutionContext({
        headers: {},
      });
      
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token type is not Bearer', async () => {
      const context = createMockExecutionContext({
        headers: {
          authorization: 'Basic token',
        },
      });
      
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should verify token and attach user to request', async () => {
      const user = { id: 1, username: 'testuser' };
      const token = 'valid-token';
      
      const request = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as unknown as Request;
      const context = createMockExecutionContext(request);
      
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(user);
      
      expect(await guard.canActivate(context)).toBe(true);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, expect.any(Object));
      // Add more assertions to check if the user is attached to the request
    });
  });
});

function createMockExecutionContext(request: any): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}
