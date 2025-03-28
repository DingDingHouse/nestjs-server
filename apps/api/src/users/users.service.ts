import { User, UserRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly userRepo: UserRepository) {}

  async findOne(username: string): Promise<User | null> {
    return this.userRepo.findOne({ username });
  }
}
