import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.getOrThrow<string>('PG_HOST'),
      port: this.configService.getOrThrow<number>('PG_PORT'),
      username: this.configService.getOrThrow<string>('PG_USER'),
      password: this.configService.getOrThrow<string>('PG_PASSWORD'),
      database: this.configService.getOrThrow<string>('PG_DB'),
      synchronize: true,
      keepConnectionAlive: true,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      cli: {
        entitiesDir: 'src',
        migrationsDir: 'src/db/migrations',
        subscribersDir: 'subscriber',
      },
    } as TypeOrmModuleOptions;
  }
}
