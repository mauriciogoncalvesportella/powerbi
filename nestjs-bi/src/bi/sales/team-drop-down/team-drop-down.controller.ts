import {BadRequestException, Controller, Get, Inject, Injectable, ParseArrayPipe, ParseBoolPipe, ParseIntPipe, Query, UseGuards} from "@nestjs/common";
import {JwtGuard} from "src/auth/jwt.guard";
import {Role} from "src/auth/role.decorator";
import {UserDeactivatedGuard} from "src/auth/user-status/user-status.guard";
import {IdMesAnoValidationPipe} from "src/shared/id-mes-ano.pipe";
import {DateOrYearMonthParam} from "../sales.types";
import { TeamDropdownGenerator } from './team-drop-down.generator'
import { IDropdownGenerator } from "./team-drop-down.types";

@UseGuards(JwtGuard, UserDeactivatedGuard)
@Role('user')
@Controller('/bi/sales/team-drop-down')
export class TeamDropdownController {
  constructor (
    @Inject(TeamDropdownGenerator)
    private generator: IDropdownGenerator
  ) {}

  @Get('nodes')
  async generateDropdown (
    @Query('team-code', ParseIntPipe)
    code: number,
    @Query('interval', new ParseArrayPipe({ items: String, separator: ',' }))
    interval: string[],
  ) {
    return await this.generator.generateDropdown(code, interval)
  }
}
