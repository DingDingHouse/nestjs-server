import { NestFactory } from '@nestjs/core';
import { RealtimeModule } from './realtime.module';

async function bootstrap() {
  const app = await NestFactory.create(RealtimeModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
