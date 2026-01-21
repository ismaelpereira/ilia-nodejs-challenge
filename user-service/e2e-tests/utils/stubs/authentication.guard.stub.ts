import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AuthenticationGuardStub implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    req.user = {
      sub: 1,
      userId: 1,
      email: 'test@e2e.com',
    };

    return true;
  }
}
