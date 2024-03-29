import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserEntity } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEntity } from '../auth/entities/auth.entity';
import { AuthModule } from '../auth/auth.module';
import { PositionEntity } from '../positions/entities/position.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, AuthEntity, PositionEntity]), AuthModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
