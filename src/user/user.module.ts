import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';
import { RolesGuard } from 'src/roles/roles.guard';
import { TokenModule } from 'src/token/token.module';
import { User } from './entities/user.entity';
import { RequestService } from './request.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  providers: [
    RequestService,
    UserService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  imports: [TokenModule, CommonModule, TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  exports: [RequestService, UserService],
})
export class UserModule {}
