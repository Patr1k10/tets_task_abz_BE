import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PositionEntity } from './entities/position.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PositionsService {
  constructor(
    @InjectRepository(PositionEntity)
    private readonly positionRepository: Repository<PositionEntity>,
  ) {}

  async findAll() {
    return this.positionRepository.find();
  }
}
