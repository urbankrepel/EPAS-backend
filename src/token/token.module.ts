import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { TokenService } from './token.service';

@Module({
  imports: [CommonModule],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
