import {BadRequestException, Body, Controller, Get, Post, Query, UseGuards} from "@nestjs/common";
import {JwtGuard} from "../jwt.guard";
import {SupervisorGuard} from "../supervisor.guard";
import {UserDeactivatedGuard} from "./user-status.guard";
import {UserStatusService} from "./user-status.service";

@UseGuards(JwtGuard, SupervisorGuard, UserDeactivatedGuard)
@Controller('user-status')
export class UserStatusController {
  constructor (
    private userStatusService: UserStatusService
  ) {}

  @Get('all')
  async getAllUsers () {
    return await this.userStatusService.getAllUsers()
  }

  @Post('active-or-deactive')
  async ActiveOrDeactive (
    @Query('code') code: number,
    @Query('status') status: boolean
  ) {
    if (!code || status == undefined) {
      throw new BadRequestException('invalid status or user code')
    }
    return this.userStatusService.activeOrDeactive(code, status)
  } 

  @Post('change-password')
  async changePassword (@Body() data: any) {
    const { userCode, password } = data
    await this.userStatusService.changePassword(userCode, password)
  }

  @Post('change-user-id')
  async changeId (@Body() data: any) {
    const { userCode, loginId } = data
    await this.userStatusService.changeUserId(userCode, loginId)
  }
}
