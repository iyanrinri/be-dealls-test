import { UserPayload } from '../auth/interfaces/user-payload.interface';

declare module 'express-serve-static-core' {
  interface Request {
    user?: UserPayload;
  }
}
