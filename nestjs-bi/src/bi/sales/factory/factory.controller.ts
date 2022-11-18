import {Controller, Get, Query, UseGuards, ParseIntPipe, BadRequestException, Inject, Param} from "@nestjs/common";
import {JwtGuard} from "src/auth/jwt.guard";
import {Role} from "src/auth/role.decorator";
import { UserDeactivatedGuard } from "src/auth/user-status/user-status.guard";
import {FactoryGenerator} from "./factory.generator";

export interface ResumeFactoryDTO {
  codes: number[],
  labels: string[],
  values: number[],
  total_orders: number[]
}

export interface ResumeFactoryProductDTO extends ResumeFactoryDTO {
  ids: string[],
  quantities: number[]
}

export interface ResumeTeamByFactoryDTO {
  codes: number[],
  types: number[],
  values: number[],
  labels: string[],
  total_orders: number[]
}

export interface IFactoryGenerator {
  menu: 'factory' | 'category'
  resume (cd: number, yearMonth: string, type: 'seller' | 'team'): Promise<ResumeFactoryDTO>
  resumeProduct (cd: number, cdFactory: number, yearMonth: string, type: 'seller' | 'team'): Promise<ResumeFactoryProductDTO>
  resumeTeamByFactory (cd: number, cdFactory: number, yearMonth: string): Promise<ResumeTeamByFactoryDTO>
}

@UseGuards(JwtGuard, UserDeactivatedGuard)
@Role('user')
@Controller('/bi/sales/:menu')
export class FactoryController {
  constructor (
    @Inject(FactoryGenerator)
    private generator: IFactoryGenerator
  ) {}

  @Get('resume')
  async resume (
    @Param() params,
    @Query('cd', ParseIntPipe) cd: number,
    @Query('type') type: string,
    @Query('yearMonth') yearMonth: string
  ) {
    if (params.menu != 'category' && params.menu != 'factory') {
      throw new BadRequestException('Param must be \'category\' or \'factory\'')
    }
    if (type != 'seller' && type != 'team') {
      throw new BadRequestException('type must be \'seller\' or \'team\'')
    }
    this.generator.menu = params.menu
    return this.generator.resume(cd, yearMonth, type)
  }

  @Get('resume-product')
  async resumeProduct (
    @Param() params,
    @Query('cd', ParseIntPipe) cd: number,
    @Query('cd-factory', ParseIntPipe) cdFactory: number,
    @Query('type') type: string,
    @Query('year-month') yearMonth: string,
  ) {
    if (params.menu != 'category' && params.menu != 'factory') {
      throw new BadRequestException('Param must be \'category\' or \'factory\'')
    }
    if (type != 'seller' && type != 'team') {
      throw new BadRequestException('type must be \'seller\' or \'team\'')
    }
    this.generator.menu = params.menu
    return this.generator.resumeProduct(cd, cdFactory, yearMonth, type)
  }

  @Get('resume-team-by-factory')
  async resumeTeam (
    @Param() params,
    @Query('cd', ParseIntPipe) cd: number,
    @Query('factory-code', ParseIntPipe) cdFactory: number,
    @Query('year-month') yearMonth: string
  ) {
    if (params.menu != 'category' && params.menu != 'factory') {
      throw new BadRequestException('Param must be \'category\' or \'factory\'')
    }
    this.generator.menu = params.menu
    return this.generator.resumeTeamByFactory(cd, cdFactory, yearMonth)
  }
}
