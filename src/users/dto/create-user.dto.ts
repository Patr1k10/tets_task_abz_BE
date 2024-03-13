import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 60)
  name: string;
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  @Length(3, 70)
  email: string;
  @IsNotEmpty()
  @IsPhoneNumber('UA')
  @IsString()
  @Length(3, 13)
  phone: string;
}
