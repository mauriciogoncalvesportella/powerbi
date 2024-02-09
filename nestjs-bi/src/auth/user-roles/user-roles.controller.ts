import { Body, Controller, Post, Query, UseGuards } from "@nestjs/common";
import { UserRolesService } from "./user-roles.service";
import { UpdateRolesDTO } from './user.roles.dto'
import { JwtGuard } from "../jwt.guard";
import { UserDeactivatedGuard } from "../user-status/user-status.guard";
import { DirectorGuard } from "../supervisor.guard";
import { CheckUserRoles } from "./check-user-roles.decorator";
import UserRoles from "./user-roles.enum";

@CheckUserRoles(UserRoles.manageusers_roles)
@Controller('user-roles')
export class UserRolesController {
  constructor (
    private userRolesService: UserRolesService
  ) {}

  @Post('update')
  async Update (@Body() input: UpdateRolesDTO) { 
    await this.userRolesService.updateProfileRoles(input)
  }
} 