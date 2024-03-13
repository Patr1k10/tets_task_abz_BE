import { Controller, Get, Post, Body, Param, Headers, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseInterceptors(FileInterceptor('photo'))
  async create(
    @UploadedFile()
    photo: Express.Multer.File,
    @Headers('Authorization') authorizationHeader: string,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.usersService.create(createUserDto, authorizationHeader, photo);
  }

  @Get()
  async findAll(@Query('page') page: number, @Query('count') count: number) {
    return this.usersService.findAll(+page, +count);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.getUserById(+id);
  }
}
