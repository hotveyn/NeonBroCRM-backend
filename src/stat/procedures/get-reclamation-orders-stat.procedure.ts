import { Injectable } from '@nestjs/common';
import { IExecutable } from '../../interfaces/executable.interface';
import { InjectModel } from '@nestjs/sequelize';
import { Order } from '../../order/entities/order.model';
import { OrderStatusEnum } from '../../order/types/order-status.enum';
import { Op } from 'sequelize';

@Injectable()
export class GetReclamationOrdersStatProcedure implements IExecutable<any> {
  constructor(
    @InjectModel(Order)
    private readonly orderModel: typeof Order,
  ) {}
  async execute(startDate: string, endDate: string) {
    const orders = await this.orderModel.count({
      where: {
        status: OrderStatusEnum.COMPLETED,
        status_date: {
          [Op.between]: [startDate, endDate],
        },
      },
    });
    const reclamations = await this.orderModel.count({
      where: {
        status: OrderStatusEnum.COMPLETED,
        reclamation_number: {
          [Op.not]: null,
        },
        status_date: {
          [Op.between]: [startDate, endDate],
        },
      },
    });
    const reclamations_percent = orders
      ? ((reclamations / orders) * 100).toFixed(1) + '%'
      : '0%';

    return { orders, reclamations, reclamations_percent };
  }
}
