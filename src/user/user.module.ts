import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';
import { RolesGuard } from 'src/roles/roles.guard';
import { TokenModule } from 'src/token/token.module';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RequestService } from './request.service';

@Module({
  providers: [
    UserService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    RequestService,
  ],
  imports: [TokenModule, CommonModule, TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  exports: [UserService, RequestService],
})
export class UserModule {}
