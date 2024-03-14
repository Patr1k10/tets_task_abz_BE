import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthEntity } from './entities/auth.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(AuthEntity)
    private readonly authRepository: Repository<AuthEntity>,
    private readonly configService: ConfigService,
  ) {}
  async generateTokens(): Promise<string> {
    const accessToken = this.jwtService.sign({}, { jwtid: Math.random().toString(36).substring(7) });
    return accessToken;
  }

  async checkAndVerification(authorizationHeader: string) {
    const token = authorizationHeader.split(' ')[1];
    const { jti } = await this.jwtService.verify(token);
    this.logger.log(`jti:${jti}`);
    const existingJti = await this.authRepository.findOne({
      where: { jwtId: jti },
    });
    this.logger.log(`existingJti:${JSON.stringify(existingJti, null, 2)}`);

    if (!existingJti) {
      const newAuthEntity = new AuthEntity();
      newAuthEntity.jwtId = jti;
      await this.authRepository.save(newAuthEntity);
    } else {
      throw new UnauthorizedException('The token expired.');
    }
  }
}
