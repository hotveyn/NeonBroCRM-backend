import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './entities/user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { HashService } from '../utils/hash.service';
import { Department } from '../department/entities/department.model';
import { UserRoleEnum } from './types/user-role.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { Op } from 'sequelize';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly hashService: HashService,
  ) {}

  async create(userCreateDto: CreateUserDto): Promise<User> {
    const isUserExist = await this.findByLogin(userCreateDto.login);
    if (isUserExist) {
      throw new HttpException(
        'Пользователь с таким логином уже существует',
        400,
      );
    }

    if (userCreateDto.code) {
      const user = await this.findByCode(userCreateDto.code);
      if (user) {
        throw new HttpException(
          'Пользователь с таким кодом уже существует',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    userCreateDto.password = await this.hashService.hash(
      userCreateDto.password,
    );

    const user = await this.userModel.create(userCreateDto);

    if (!user.code) {
      user.code = user.id + '100000';
      await user.save();
    }
    return user;
  }

  async findByLogin(login: string): Promise<User | null> {
    return this.userModel.findOne({
      where: { login },
      include: [Department],
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.userModel.findOne({
      where: { id },
      include: [Department],
    });
  }

  async findAllNormal(): Promise<User[] | null> {
    return this.userModel.findAll({
      where: {
        [Op.or]: [
          { role: UserRoleEnum.EMPLOYEE },
          { role: UserRoleEnum.MANAGER },
          { role: UserRoleEnum.STORAGE },
        ],
      },
      include: [Department],
    });
  }

  async findAllFired(): Promise<User[] | null> {
    return this.userModel.findAll({
      where: {
        role: 'fired',
      },
      include: [Department],
    });
  }

  async removeById(id: number): Promise<User | void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    await user.destroy();
    return user;
  }

  async fire(id: number): Promise<User | void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    user.role = UserRoleEnum.FIRED;
    await user.save();
    return user;
  }

  async unfire(id: number): Promise<User | void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    user.role = UserRoleEnum.EMPLOYEE;
    await user.save();
    return user;
  }

  async findByCode(code: string): Promise<User | null> {
    return this.userModel.findOne({
      where: { code },
      include: [Department],
    });
  }

  async update(updateUserDto: UpdateUserDto, id: number) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const payload = {
      login: updateUserDto.login,
      password: updateUserDto.password,
      code: updateUserDto.code,
      first_name: updateUserDto.first_name,
      last_name: updateUserDto.last_name,
      patronymic_name: updateUserDto.patronymic_name,
      start_work_date: updateUserDto.start_work_date,
    };

    if (payload.password) {
      payload.password = await this.hashService.hash(payload.password);
    }

    await user.update(payload);

    user.departments.forEach((department: Department) => {
      user.$remove('department', department.id);
    });

    updateUserDto.departments.forEach((departmentId: number) => {
      user.$add('department', departmentId);
    });

    //TODO: ало это жёстко?
    return [];
    // if (updateUserDto.password) {
    //   updateUserDto.password = await this.hashService.hash(
    //     updateUserDto.password,
    //   );
    // }
    // return user.update(updateUserDto);
  }
}
