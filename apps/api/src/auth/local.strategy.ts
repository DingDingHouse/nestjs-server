import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';
import { User } from '@app/common';
import { Lean } from '@app/common/types/lean-document';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(
    username: string,
    password: string,
  ): Promise<Omit<Lean<User>, 'password'>> {
    const user = await this.authService.validateUser(username, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return user;
  }
}
