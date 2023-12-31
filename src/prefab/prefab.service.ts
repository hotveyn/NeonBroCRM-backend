import { Injectable } from '@nestjs/common';
import { CreatePrefabDto } from './dto/create-prefab.dto';
import { UpdatePrefabDto } from './dto/update-prefab.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Prefab } from './entities/prefab.entity';
import { OrderType } from '../order-type/entities/order-type.entity';

@Injectable()
export class PrefabService {
  constructor(
    @InjectModel(Prefab)
    private readonly PrefabModel: typeof Prefab,
  ) {}

  async create(createPrefabDto: CreatePrefabDto) {
    return await this.PrefabModel.create(createPrefabDto);
  }

  async findAll() {
    return await this.PrefabModel.findAll({
      include: [OrderType],
    });
  }

  async findOne(id: number) {
    return await this.PrefabModel.findOne({
      where: { id },
      include: [OrderType],
    });
  }

  async update(id: number, updatePrefabDto: UpdatePrefabDto) {
    return await this.PrefabModel.update(updatePrefabDto, { where: { id } });
  }

  async remove(id: number) {
    return await this.PrefabModel.destroy({ where: { id } });
  }
}
