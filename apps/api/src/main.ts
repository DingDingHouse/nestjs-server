import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';
import { ValidationPipe } from '@nestjs/common';
import { SystemInitService } from './system-init.service';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 🚀 Initialize roles & root user
  const initService = app.get(SystemInitService);
  await initService.init();

  await app.listen(process.env.port ?? 3000);
}
bootstrap();
