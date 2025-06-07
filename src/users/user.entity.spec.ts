import { User } from './entities/user.entity';

describe('User Entity', () => {
  it('should create a user instance', () => {
    const user = new User();
    user.id = 1;
    user.username = 'testuser';
    user.password = 'password';
    user.role = 'admin';
    user.salary = 5000;
    
    expect(user).toBeDefined();
    expect(user.id).toEqual(1);
    expect(user.username).toEqual('testuser');
    expect(user.password).toEqual('password');
    expect(user.role).toEqual('admin');
    expect(user.salary).toEqual(5000);
  });
});
