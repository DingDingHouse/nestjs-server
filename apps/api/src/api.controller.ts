import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiService } from './api.service';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { User } from '@app/common';

@Controller()
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req: { user: Omit<User, 'password'> }) {
    return req.user;
  }
}
