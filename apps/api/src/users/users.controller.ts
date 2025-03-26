import { UserRepository } from '@app/common';
import { Controller, Get } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private readonly userRepository: UserRepository) {}
  @Get('test-connection')
  async testConnection() {
    try {
      const user = await this.userRepository.findOne({});
      return { message: 'Datanase connection is working', user };
    } catch (error) {
      return { message: 'Database connection failed', error: error as Error };
    }
  }
  @Get()
  getUsers() {
    return 'Users';
  }
}
