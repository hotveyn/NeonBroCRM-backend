import { Injectable } from '@nestjs/common';
import { IExecutable } from '../../interfaces/executable.interface';
import { OrderStatusEnum } from '../../order/types/order-status.enum';
import { Op } from 'sequelize';
import { Order } from '../../order/entities/order.model';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class GetStoppedOrdersStatProcedure implements IExecutable<any> {
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

    const orders_stopped = await this.orderModel.count({
      where: {
        status: OrderStatusEnum.STOP,
        status_date: {
          [Op.between]: [startDate, endDate],
        },
      },
    });
    const stopped_percent = orders
      ? ((orders_stopped / orders) * 100).toFixed(1) + '%'
      : '0%';

    return { orders, orders_stopped, stopped_percent };
  }
}
