import {
  AfterCreate,
  AllowNull,
  BelongsToMany,
  Column,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { UserDepartments } from '../../join-tables/user-departments/entities/user-departments.model';
import { User } from '../../user/entities/user.model';
import { Break } from '../../break/entities/break.model';
import { OrderStage } from '../../order-stage/entities/order-stage.model';
import { MonetaryMatrix } from '../../monetary-matrix/entities/monetary-matrix.entity';
import { OrderTypeService } from '../../order-type/order-type.service';
import { OrderType } from '../../order-type/entities/order-type.entity';

interface DepartmentCreationAttributes {
  name: string;
}

@Table({ tableName: 'departments' })
export class Department extends Model<
  Department,
  DepartmentCreationAttributes
> {
  @AllowNull(false)
  @Column
  name: string;

  @HasMany(() => UserDepartments, { onDelete: 'CASCADE' })
  userDepartments: UserDepartments[];

  @BelongsToMany(() => User, () => UserDepartments)
  users: Array<User & { UserDepartments: UserDepartments }>;

  @HasMany(() => Break, { onDelete: 'CASCADE' })
  breaks: Break[];

  @HasMany(() => OrderStage, { onDelete: 'SET NULL' })
  orderStages: OrderStage[];

  @HasMany(() => MonetaryMatrix)
  monetary_matrices: MonetaryMatrix[];

  @AfterCreate
  static async addMatrixAfterCreate(instance: Department) {
    const orderTypes = await OrderType.findAll();
    await Promise.all(
      orderTypes.map(async (ot) => {
        return MonetaryMatrix.create({
          order_type_id: ot.id,
          department_id: instance.id,
        });
      }),
    );
  }
}
