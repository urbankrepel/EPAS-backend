import { Module } from '@nestjs/common';
import { TokenModule } from 'src/token/token.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [TokenModule],
})
export class AuthModule {}
