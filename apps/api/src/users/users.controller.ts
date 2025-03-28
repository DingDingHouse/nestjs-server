import { UserRepository } from '@app/common';
import { Controller } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private readonly userRepository: UserRepository) {}
}
