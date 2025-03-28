import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Lean } from '@app/common/types/lean-document';
import { User } from '@app/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UsersService) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<Omit<Lean<User>, 'password'> | null> {
    const user = await this.userService.findOne(username);

    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    // Exclude password from returned user object
    const { password: _, ...safeUser } = user;

    return safeUser;
  }
}
