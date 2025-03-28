import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiService } from './api.service';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { Lean } from '@app/common/types/lean-document';
import { User } from '@app/common';

@Controller()
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(
    @Request()
    req: {
      user: Omit<Lean<User>, 'password'>;
    },
  ): Omit<Lean<User>, 'password'> {
    return req.user;
  }
}
