import { MigrationInterface, QueryRunner } from 'typeorm';
import { PositionEntity } from '../../positions/entities/position.entity';
import { fakerUK as faker } from '@faker-js/faker';
import { UserEntity } from '../../users/entities/user.entity';

export class Migrations1622463985000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "position_entity" (
                "id" SERIAL PRIMARY KEY,
                "name" VARCHAR(255) NOT NULL UNIQUE,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "deleted_at" TIMESTAMP
            )
        `);

    await queryRunner.query(`
        INSERT INTO "position_entity" ("name") VALUES
            ('Security'),
            ('Designer'),
            ('Content manager'),
            ('Lawyer')
    `);

    const userRepository = queryRunner.manager.getRepository(UserEntity);
    const positionRepository = queryRunner.manager.getRepository(PositionEntity);

    const positions = await positionRepository.find();

    const users = [];
    for (let i = 0; i < 45; i++) {
      const user = new UserEntity();
      user.name = faker.internet.userName();
      user.email = faker.internet.email();
      user.photo = faker.image.avatar();
      user.phone = `+38${faker.phone.number()}`;
      user.position = positions[Math.floor(Math.random() * positions.length)];

      users.push(user);
    }

    await userRepository.save(users);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.getRepository(UserEntity).clear();
    await queryRunner.query(`DROP TABLE IF EXISTS "position_entity"`);

  }
}
