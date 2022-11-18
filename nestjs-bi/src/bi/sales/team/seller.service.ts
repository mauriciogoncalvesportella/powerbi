import {BadRequestException, Inject, Injectable, UnauthorizedException} from "@nestjs/common";
import {UserAuth} from "src/auth/auth.interfaces";
import {CadVendedorEntity} from "src/database/entity/tenant/cad_vendedor.entity";
import {RequestMetadata} from "src/shared/request-metadata.provider";
import {Connection, EntityManager, In} from "typeorm";
import {SellerWithGoal, SellersWithTeam, MapSellerWithGoal, MapSellerWithGoalAndTotalGoal} from "./team.types";

export interface SellerTeamWithGoal {
  sellerCode: number,
  sellerName: string,
  teamCode: number,
  teamId: string,
  teamName: string
}

@Injectable()
export class SellerService {
  private manager: EntityManager
  constructor (
    @Inject('CONNECTION')
    connection: Connection,
    private requestMetadata: RequestMetadata,
  ) {
    this.manager = connection.manager
  }

  get user () {
    return this.requestMetadata.user as UserAuth
  }

  async sellersWithTeam (cdArr: number[]): Promise<SellersWithTeam[]> {
    const sellersWithTeam: SellersWithTeam[] = await this.manager.createQueryBuilder(CadVendedorEntity, 'vendedor')
      .leftJoinAndMapOne('vendedor.equipe', 'CadEquipeEntity', 'equipe', 'vendedor.cdEquipe = equipe.cd')
      .select('vendedor.cd', 'sellerCode')
      .addSelect('equipe.cd', 'teamCode')
      .addSelect('vendedor.nmVendedor', 'seller')
      .addSelect('equipe.idEquipe', 'team')
      .where({
        cd: In(cdArr)
      })
      .getRawMany()

    for (const seller of sellersWithTeam) {
      if (!(seller.team as string).startsWith(this.user.idEquipe)) {
        throw new UnauthorizedException()
      }
    }

    return sellersWithTeam
  }

  async sellersWithGoal (idMesAno: string, cdArr: number[]): Promise<MapSellerWithGoalAndTotalGoal> {
    const raw: any[] = await this.manager.createQueryBuilder(CadVendedorEntity, 'vendedor')
      .leftJoinAndMapOne('vendedor.equipe', 'CadEquipeEntity', 'equipe', 'equipe.cd = vendedor.cdEquipe')
      .select('vendedor.cd', 'sellerCode')
      .addSelect('vendedor.nmVendedor', 'sellerName')
      .addSelect('vendedor.vlMetaMensal', 'currentGoal')
      .addSelect('vendedor.jsMetaMensal', 'objectGoal')
      .addSelect('equipe.cd', 'teamCode')
      .addSelect('equipe.idEquipe', 'teamId')
      .where({ cd: In(cdArr) })
      .getRawMany()

    const mapSellerWithGoal: MapSellerWithGoal = new Map()
    let totalGoal: number = 0

    for (const item of raw) {
      if (!(item.teamId as string).startsWith(this.user.idEquipe)) {
        throw new UnauthorizedException()
      }

      if (item.objectGoal[idMesAno] == null) {
        item.objectGoal[idMesAno] = 0
        // throw new BadRequestException(`User "${item.sellerName}" has monthly no goal "${idMesAno}" attached to him`)
      }

      totalGoal += parseFloat(item.objectGoal[idMesAno])
      mapSellerWithGoal.set(item.sellerCode, {
        sellerCode: item.sellerCode,
        sellerName: item.sellerName,
        teamId: item.teamId,
        teamCode: item.teamCode,
        goal: parseFloat(item.objectGoal[idMesAno]),
      })
    }

    return {
      totalGoal,
      mapSellerWithGoal
    }
  }
}
