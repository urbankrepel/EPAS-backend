import {
  MiddlewareConsumer,
  Module,
  NestModule
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { TimetableModule } from './timetable/timetable.module';
import { TokenModule } from './token/token.module';
import { UserMiddleware } from './user/middleware/user.middleware';
import { UserModule } from './user/user.module';
import { WorkshopModule } from './workshop/workshop.module';

@Module({
  imports: [
    UserModule,
    CommonModule,
    TokenModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: true,
      autoLoadEntities: true,
      ssl: process.env.DB_SSL === 'true',
    }),
    WorkshopModule,
    TimetableModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware).forRoutes('user', 'workshop', 'timetable');
  }
}
