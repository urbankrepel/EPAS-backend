import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { TokenModule } from 'src/token/token.module';
import { RequestService } from './request.service';
import { UserController } from './user.controller';

@Module({
  providers: [RequestService],
  imports: [TokenModule, CommonModule],
  controllers: [UserController],
  exports: [RequestService],
})
export class UserModule {}
