import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '@app/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UsersService) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.userService.findOne(username);
    console.log(user);
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    //TODO: we have to remove password
    return user;
  }
}
