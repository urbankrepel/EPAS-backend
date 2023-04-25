import {
  CacheModule,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { TimetableModule } from './timetable/timetable.module';
import { TokenModule } from './token/token.module';
import { UserMiddleware } from './user/middleware/user.middleware';
import { UserModule } from './user/user.module';
import { WorkshopModule } from './workshop/workshop.module';
import { redisStore } from 'cache-manager-redis-store';
import { RedisClientOptions } from 'redis';
import configuration from './config/configuration';

@Module({
  imports: [
    UserModule,
    CommonModule,
    TokenModule,
    ConfigModule.forRoot({
      load: [configuration],
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
      ssl:
        process.env.DB_SSL !== 'true'
          ? false
          : {
              rejectUnauthorized: false,
            },
    }),
    CacheModule.register<RedisClientOptions>({
      store: redisStore as any,
      socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      },
      password: process.env.REDIS_PASSWORD,
      isGlobal: true,
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
