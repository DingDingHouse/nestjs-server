import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { DatabaseModule } from '@app/common';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { SystemInitService } from './system-init.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        ROOT_NAME: Joi.string().required(),
        ROOT_USERNAME: Joi.string().required(),
        ROOT_PASSWORD: Joi.string().required(),
      }),
      envFilePath: './apps/api/.env',
    }),
    DatabaseModule,
    UsersModule,
    RolesModule,
    AuthModule,
  ],
  controllers: [ApiController],
  providers: [ApiService, SystemInitService],
})
export class ApiModule {}
