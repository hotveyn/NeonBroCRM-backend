import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ToWorkDto } from './dto/to-work.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { SetRatingDto } from './dto/set-rating.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IRequestJWT } from '../auth/interfaces/IRequestJWT';
import { Roles } from '../auth/roles.decorator';
import { UserRoleEnum } from '../user/types/user-role.enum';
import { CreateOrderByPrefabDto } from './dto/create-order-by-prefab.dto';
import { GetOrdersDto } from './dto/get-orders.dto';
import { GetOrdersProcedure } from './procedures/get-orders.procedure';
import { MarkOrderAsBreakProcedure } from './procedures/mark-as-break.procedure';
import { MarkOrderAsDefectiveDto } from './dto/mark-order-as-defective.dto';
import { GetOrderStagesProcedure } from './procedures/get-order-stages.procedure';

@UseGuards(JwtAuthGuard)
@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly getOrdersProcedure: GetOrdersProcedure,
    private readonly markOrderAsDefectiveProcedure: MarkOrderAsBreakProcedure,
    private readonly getOrderStagesProcedure: GetOrderStagesProcedure,
  ) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Post('by-prefab')
  createByPrefab(@Body() createOrderByPrefabDto: CreateOrderByPrefabDto) {
    return this.orderService.createByPrefab(createOrderByPrefabDto);
  }

  @Patch('/:id/set-rating')
  setRating(@Param('id', ParseIntPipe) id: number, @Body() dto: SetRatingDto) {
    return this.orderService.setRating(id, dto.rating);
  }

  @Get('/stop')
  findAllStop() {
    return this.orderService.findAllStop();
  }

  @Get('/completed')
  findAllCompleted() {
    return this.orderService.findAllCompleted();
  }

  @Get('/completed-reclamations')
  findAllCompletedReclamations() {
    return this.orderService.findAllCompletedReclamations();
  }

  @Get('/break')
  findAllBreak() {
    return this.orderService.findAllBreak();
  }

  @Get('/new')
  findAllNew() {
    return this.orderService.findAllNew();
  }

  @Get('/in-work')
  findAllInWork() {
    return this.orderService.findAllInWork();
  }

  @Get('/resources/new')
  findAllNewResources() {
    return this.orderService.findAllNewResources();
  }

  @Get('/resources/enough')
  findAllEnoughResources() {
    return this.orderService.findAllEnoughResources();
  }

  @Get('/resources/not-enough')
  findAllNotEnoughResources() {
    return this.orderService.findAllNotEnoughResources();
  }

  @Get('/:id')
  info(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.info(id);
  }

  @Patch('/:id/set-work')
  setWork(
    @Param('id', ParseIntPipe) id: number,
    @Body() toWorkDto: ToWorkDto,
    @Req() req: IRequestJWT,
  ) {
    return this.orderService.setWork(id, toWorkDto, req.user.id);
  }

  @Patch('/:id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.restore(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.orderService.update(id, updateOrderDto);
  }

  @Patch('/:id/complete')
  setComplete(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.setComplete(id);
  }

  @Patch('/:id/stop')
  setStop(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.setStop(id);
  }

  @Roles(UserRoleEnum.STORAGE)
  @Patch('/:id/resources/enough')
  setResourcesEnough(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: IRequestJWT,
  ) {
    return this.orderService.setResourcesEnough(id, req.user.id);
  }

  @Roles(UserRoleEnum.STORAGE)
  @Patch('/:id/resources/not-enough')
  setResourcesNotEnough(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: IRequestJWT,
  ) {
    return this.orderService.setResourcesNotEnough(id, req.user.id);
  }

  @Roles(UserRoleEnum.STORAGE)
  @Patch('/:id/resources/null')
  setResourcesNull(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: IRequestJWT,
  ) {
    return this.orderService.setResourcesNull(id, req.user.id);
  }

  @Patch('/hide/:id')
  setStatusHidden(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.setStatusHidden(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.remove(id);
  }

  @Get('/')
  getOrders(@Query() payload: GetOrdersDto) {
    return this.getOrdersProcedure.execute(payload);
  }

  @Get('/:id/stages')
  getOrderStages(@Param('id', ParseIntPipe) orderId: number) {
    return this.getOrderStagesProcedure.execute(orderId);
  }

  @Patch('/:id/break')
  markOrderAsBreak(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MarkOrderAsDefectiveDto,
  ) {
    return this.markOrderAsDefectiveProcedure.execute(id, dto);
  }
}
