import {Controller, Get, ParseIntPipe, Query, UnauthorizedException, UseGuards} from "@nestjs/common";
import {UserAuth} from "src/auth/auth.interfaces";
import {JwtGuard} from "src/auth/jwt.guard";
import {Role} from "src/auth/role.decorator";
import {SupervisorGuard} from "src/auth/supervisor.guard";
import {UserDeactivatedGuard} from "src/auth/user-status/user-status.guard";
import {RequestMetadata} from "src/shared/request-metadata.provider";
import {TeamService} from "./team.service";
import {TeamsSellersFromTeamDTO} from "./team.types";

@UseGuards(JwtGuard, UserDeactivatedGuard)
@Role('user')
@Controller('bi/sales/equipe')
export class TeamController {
  constructor(
    private teamService: TeamService,
    private requestMetadata: RequestMetadata
  ) {}

  @UseGuards(SupervisorGuard)
  @Get('tree')
  async tree() {
    return await this.teamService.hierarchyTree()
  }

  @UseGuards(SupervisorGuard)
  @Get('own-teams')
  async teams() {
    return await this.teamService.hierarchy()
  }

  @UseGuards(SupervisorGuard)
  @Get('own-sellers')
  async sellers () {
    return await this.teamService.sellersFromTeams()
  }

  @UseGuards(SupervisorGuard)
  @Get('teams-sellers-from-team')
  async teamsSellersFromTeam (
    @Query('cd', new ParseIntPipe())
    cd: number
  ): Promise<TeamsSellersFromTeamDTO> {
    const data = await this.teamService.teamsSellersFromTeam(cd)
    const user = this.requestMetadata.user as UserAuth
    if (!data.parentTeam.teamId?.includes(user.idEquipe)) {
      throw new UnauthorizedException
    }
    return data
  }
}
