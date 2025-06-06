import { Test, TestingModule } from '@nestjs/testing';
import { AdminGuard } from './admin.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<AdminGuard>(AdminGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if public route is set', () => {
      const context = createMockExecutionContext({});
      
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
      
      expect(guard.canActivate(context)).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalled();
    });

    it('should return true if user has admin role', () => {
      const user = { id: 1, username: 'admin', role: 'admin' };
      const context = createMockExecutionContext({ user });
      
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should throw ForbiddenException if user does not have admin role', () => {
      const user = { id: 1, username: 'employee', role: 'employee' };
      const context = createMockExecutionContext({ user });
      
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      
      expect(() => guard.canActivate(context)).toThrow('You do not have permission (roles)');
    });

    it('should throw ForbiddenException if no user in request', () => {
      const context = createMockExecutionContext({ user: undefined });
      
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      
      expect(() => guard.canActivate(context)).toThrow('User not found');
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
  } as ExecutionContext;
}
