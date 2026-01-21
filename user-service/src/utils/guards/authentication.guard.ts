import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import jwt from 'jsonwebtoken';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor() {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req: Request = ctx.switchToHttp().getRequest();

    try {
      const authHeader = req.headers.authorization;
      console.log('authHeader: ', authHeader);
      if (!authHeader) {
        throw new HttpException('Missing Token', HttpStatus.UNAUTHORIZED);
      }

      const [, token] = authHeader.split(' ');
      const decoded = jwt.verify(
        token,
        process.env.JWT_PRIVATE_KEY as unknown as string,
      );
      req.user = decoded;
      return true;
    } catch (err) {
      throw new HttpException('Invalid Token', HttpStatus.UNAUTHORIZED);
    }
  }
}
