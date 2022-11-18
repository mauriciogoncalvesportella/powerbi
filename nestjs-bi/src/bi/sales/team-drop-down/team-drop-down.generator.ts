import {Inject} from "@nestjs/common";
import {createTeamNode, createTeamDropDownDTO, DropdownNodeDTO, IDropdownGenerator, IDropdownQueries, createSellerNode } from "./team-drop-down.types";
import { TeamDropdownQueries } from "./team-drop-down.queries";

export class TeamDropdownGenerator implements IDropdownGenerator {
  constructor (
    @Inject(TeamDropdownQueries)
    private queries: IDropdownQueries
  ) {}

  async generateDropdown (code: number, interval: string[]): Promise<DropdownNodeDTO> {
    const teams = await this.queries.getTeams(code)
    const root: DropdownNodeDTO = createTeamNode(teams.splice(0, 1)[0])
    const map: Map<number, DropdownNodeDTO> = new Map()
    map.set(root.code, root)
    for (const team of teams) {
      const node = createTeamNode(team)
      map.set(team.team_code, node)
      map.get(team.parent_team_code).children?.push(node)
    }
    const sellers = await this.queries.getSellers(code, interval)
    for (const seller of sellers) {
      const node = createSellerNode(seller)
      map.get(seller.team_code).children?.push(node)
    }
    return root
  }
}
