import { Injectable } from '@nestjs/common';

@Injectable()
export class RealtimeService {
  getHello(): string {
    return 'Hello World!';
  }
}
