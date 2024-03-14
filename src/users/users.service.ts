import { ConflictException, Injectable, Logger, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '@nestjs/config';
import tinify from 'tinify';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class UsersService {
  private readonly logger: Logger = new Logger(UsersService.name);
  private readonly s3Client: S3Client; // Initialize S3 client

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS'),
      },
    });
    tinify.key = this.configService.getOrThrow('TINIFY_API_KEY');
  }
  async create(createUserDto: CreateUserDto, authorizationHeader: string, photo: Express.Multer.File) {
    const existingUser = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
        phone: createUserDto.phone,
      },
    });
    if (existingUser) {
      throw new ConflictException('User with this phone or email already exist');
    }
    await this.authService.checkAndVerification(authorizationHeader);
    const publicUrl = await this.processAndSaveImage(photo);


    const user = this.userRepository.create({
      ...createUserDto,
      photo: publicUrl,
    });
    const newUser = await this.userRepository.save(user);
    return { success: true, userId: newUser.id, message: 'New user successfully registered' };
  }

  async findAll(page: number = 1, count: number = 6): Promise<any> {
    const skip = (page - 1) * count;
    const [users, totalUsers] = await this.paginateUsers(page, count);
    this.logger.log(JSON.stringify(users));

    const totalPages = Math.ceil(totalUsers / count);
    const nextUrl = page < totalPages ? `http://18.197.131.200:3000/users?page=${page + 1}&count=${count}` : null;
    const prevUrl = page > 1 ? `http://18.197.131.200:3000/users?page=${page - 1}&count=${count}` : null;

    return {
      success: true,
      page,
      total_pages: totalPages,
      total_users: totalUsers,
      count,
      links: {
        next_url: nextUrl,
        prev_url: prevUrl,
      },
      users: users.map((user) => ({
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        position: user.position.name,
        position_id: user.position.id.toString(),
        photo: user.photo,
      })),
    };
  }

  async getUserById(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id: id }, relations: ['position'] });
    if (!user) {
      throw new NotFoundException('User is not found');
    }
    return user;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  private async generateFileName(fileName: string): Promise<string> {
    const timestamp = new Date().getTime();
    const hash = crypto.createHash('md5').update(timestamp.toString()).digest('hex');
    const ext = path.extname(fileName);
    return `${hash}${ext}`;
  }

  private async processAndSaveImage(photo: Express.Multer.File): Promise<string> {
    if (!photo) {
      throw new UnprocessableEntityException('Photo is required');
    }
    const validFormats = ['image/jpeg'];
    if (!validFormats.includes(photo.mimetype)) {
      throw new UnprocessableEntityException('Only JPEG format is allowed');
    }
    if (photo.size > 5 * 1024 * 1024) {
      throw new UnprocessableEntityException('Photo size should be less than 5MB');
    }
    const fileName = await this.generateFileName(photo.originalname);
    const resizeBuffer = Buffer.from(
      await tinify
        .fromBuffer(photo.buffer)
        .resize({
          method: 'fit',
          width: 70,
          height: 70,
        })
        .toBuffer(),
    );

    await this.uploadToS3(resizeBuffer, fileName);

    const publicUrl = `https://s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${this.configService.get('S3_BUCKET_NAME')}/${fileName}`; // Update with your bucket name
    this.logger.log(publicUrl);

    return publicUrl;
  }
  private async uploadToS3(buffer: Buffer, objectKey: string) {
    const command = new PutObjectCommand({
      Bucket: this.configService.get('S3_BUCKET_NAME'), // Set your S3 bucket name
      Key: objectKey,
      Body: buffer,
      ContentType: 'image/jpeg',
    });
    await this.s3Client.send(command);
    this.logger.log(`Successfully uploaded image to S3: ${objectKey}`);
  }

  private async paginateUsers(page: number, count: number): Promise<[UserEntity[], number]> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.position', 'position')
      .skip((page - 1) * count)
      .take(count);

    const data = await queryBuilder.getMany();
    const total = await queryBuilder.getCount();

    if (!data.length) {
      throw new NotFoundException('No data found');
    }

    return [data, total];
  }
}
