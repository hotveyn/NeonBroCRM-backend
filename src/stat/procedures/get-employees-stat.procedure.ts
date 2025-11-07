import { Injectable } from '@nestjs/common';
import { IExecutable } from '../../interfaces/executable.interface';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../../user/entities/user.model';
import { UserRoleEnum } from '../../user/types/user-role.enum';
import { Department } from '../../department/entities/department.model';
import { Op } from 'sequelize';
import { Order } from '../../order/entities/order.model';
import { OrderStage } from '../../order-stage/entities/order-stage.model';
import { UserDepartments } from '../../join-tables/user-departments/entities/user-departments.model';

@Injectable()
export class GetEmployeesStatProcedure implements IExecutable<any> {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(OrderStage)
    private readonly orderStageModel: typeof OrderStage,
  ) {}

  async execute(
    startDate: string,
    endDate: string,
  ): Promise<
    {
      id: any;
      code: string;
      full_name: string;
      departments: (Department & {
        UserDepartments: UserDepartments;
      })[];
      neon_length: number;
      stages: number;
      stages_break: number;
      break_percent: string;
    }[]
  > {
    const users = await this.userModel.findAll({
      where: {
        role: UserRoleEnum.EMPLOYEE,
      },
      include: [{ model: Department, attributes: ['name'] }],
    });
    return Promise.all(
      users.map(async (user) => {
        const serializedUser = {
          id: user.id,
          code: user.code,
          full_name: `${user.last_name} ${user.first_name} ${user.patronymic_name}`,
          departments: user.departments,
          neon_length: 0,
          stages: 0,
          stages_break: 0,
          break_percent: '',
        };

        const stages = await this.orderStageModel.findAll({
          where: {
            is_active: false,
            user_id: user.id,
            ready_date: {
              [Op.between]: [startDate, endDate],
            },
          },
          include: [Order, Department],
        });

        stages.map((stage) => {
          if (stage.break_id) {
            serializedUser.stages_break += 1;
            return;
          } else if (stage.department) {
            if (
              stage.department.name === 'Пайка' ||
              stage.department.name === 'Сборка'
            ) {
              serializedUser.neon_length += stage.order.neon_length;
              serializedUser.neon_length =
                +serializedUser.neon_length.toFixed(1);
            }
          }
          serializedUser.stages += 1;
        });

        serializedUser.break_percent = serializedUser.stages
          ? (
              (serializedUser.stages_break / serializedUser.stages) *
              100
            ).toFixed(1) + '%'
          : '0%';

        return serializedUser;
      }),
    );
  }
}
