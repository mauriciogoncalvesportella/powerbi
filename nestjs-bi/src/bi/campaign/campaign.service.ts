import {Inject, Injectable, UnauthorizedException} from "@nestjs/common";
import {UserAuth} from "src/auth/auth.interfaces";
import {CadEquipeEntity} from "src/database/entity/tenant/cad_equipe.entity";
import {CadEquipeMetaMensalEntity} from "src/database/entity/tenant/cad_equipe_meta_mensal.entity";
import {CadVendedorEntity} from "src/database/entity/tenant/cad_vendedor.entity";
import {RequestMetadata} from "src/shared/request-metadata.provider";
import {Connection, In} from "typeorm";
import * as _ from 'lodash'
import { CampaignRepository, CampaignRevenueDTO, CampaignVendorDTO, CampaignProductDTO, ProductVendorDTO } from "./campaign.repository";
import { CadCampanhaEntity } from "src/database/entity/tenant/cad_campanha.entity";

// Onde fica a lógica de negócio (ex: cálculos, regras, validações).
// Não é responsável por receber as requisições do frontend, apenas processa as informações.
// Não é responsável por retornar as respostas para o frontend, apenas processa as informações.

// SERVICE PRINCIPAL DA APLICAÇÃO

@Injectable()
export class CampaignService {
  constructor(
    @Inject('CONNECTION')
    private connection: Connection, // conexão com o banco de dados
    private requestMetadata: RequestMetadata, // metadata da requisição login do usuário
    private campaignRepository: CampaignRepository, // repositório de campanhas
  ) {}

  get user () {
    return this.requestMetadata.user as UserAuth
  }

  async getAllCampaigns(): Promise<CampaignRevenueDTO[]> {
    return this.campaignRepository.getCampaigns();
  }

  async getCampaignById(campaignId: number): Promise<CadCampanhaEntity | undefined> {
    return this.campaignRepository.getCampaignById(campaignId);
  }

  async getVendorsByCampaign(campaignId: number): Promise<CampaignVendorDTO[]> {
    return this.campaignRepository.getVendorsByCampaign(campaignId);
  }

  async getCampaignProducts(campaignId: number): Promise<CampaignProductDTO[]> {
    return this.campaignRepository.getCampaignProducts(campaignId);
  }

  async getProductVendors(campaignId: number, productId: number): Promise<ProductVendorDTO[]> {
    return this.campaignRepository.getProductVendors(campaignId, productId);
  }

  async getVendorProductsByCampaign(campaignId: number, vendorId: number): Promise<any[]> {
    return this.campaignRepository.getVendorProductsByCampaign(campaignId, vendorId);
  }

  /*
   * @desc Busca lista de vendedores com a meta vinculada de um mês específico
   * @return lista de Vendedores com Meta
  */
  async sellers (...cdArr: number[]) {
    const { manager } = this.connection
    const raw: any[] = await manager.createQueryBuilder(CadVendedorEntity, 'vendedor')
      .leftJoinAndMapOne('vendedor.team', 'CadEquipeEntity', 'equipe', 'vendedor.cdEquipe = equipe.cd')
      .select('vendedor.cd', 'sellerCode')
      .addSelect('equipe.cd', 'teamCode')
      .addSelect('equipe.idEquipe', 'teamId')
      .where('vendedor.cd IN (:...cdArr)', { cdArr })
      .getMany()

    for (const seller of raw) {
      const idEquipe = seller.team.idEquipe as string
      if (!idEquipe.startsWith(this.user.idEquipe)) {
        throw new UnauthorizedException
      }
    }

    return raw
  }

  private campaignLeaf (teamEntities: CadEquipeEntity[]) {
    const isParent: Map<number, boolean> = new Map()
    const ret: { [id: string]: boolean } = {}

    for (const team of teamEntities) {
      isParent.set(team.cdEquipePai, true)
    }

    for (const team of teamEntities) {
      ret[team.cd] = isParent.get(team.cd) ? false : true
    }

    return ret
  }

  async imediateTeams (teams: number[]): Promise<CadEquipeEntity[]> {
    const { manager } = this.connection
    return await manager.find(CadEquipeEntity, {
      where: {
        cdEquipePai: In(teams),
      }
    })
  }

  /*
   * @desc Busca lista de equipes com meta de um mês específico
   * @return lista de Equipes com Metas
  */
  async campaignsWithGoal (idMesAno: string, ...cdArr: number[]): Promise<{
    goal: number,
    campaigns: CadEquipeEntity[],
    teams: CadEquipeEntity[],
    teamsLeaf: { [id: string]: boolean }
  }> {
    const { manager } = this.connection

    const raw: any = await manager.createQueryBuilder(CadEquipeEntity, 'equipe')
      .leftJoinAndMapOne('equipe.meta', 'CadEquipeMetaMensalEntity', 'meta', `meta.cdEquipe = equipe.cd AND meta.idMesAno = '${idMesAno}'`)
      .select('equipe', 'team')
      .addSelect('meta', 'goal')
      .where({
        cd: In(cdArr)
      })
      .getMany()

    const mapTeamWithGoal: Map<number, { team: CadEquipeEntity, goal: CadEquipeMetaMensalEntity }> = new Map()
    const teams: CadEquipeEntity[] = []
    let totalGoal: number = 0

    for (const data of raw) {
      if (!data.meta || data.meta?.vlMetaVenda == null) {
        data.meta = {
          idMesAno: idMesAno,
          cdEquipe: data.cd,
          vlMetaVenda: 0
        }
        // throw new BadRequestException(`Team '${data.nmEquipe}' has no goal attached for '${idMesAno}'`)
      }

      let team: CadEquipeEntity = _.omit(data, 'meta') as CadEquipeEntity
      let goal: CadEquipeMetaMensalEntity = data.meta
      goal.vlMetaVenda = parseFloat(data.meta.vlMetaVenda)

      teams.push(team)
      totalGoal += goal.vlMetaVenda
      mapTeamWithGoal.set(team.cd, {
        team: team,
        goal: goal
      })
    }

    return {
      goal: totalGoal,
      campaigns: teams,
      teams,
      teamsLeaf: await this.teamsLeaf(teams)
    }
  }
  teamsLeaf(teams: CadEquipeEntity[]): { [id: string]: boolean; } | PromiseLike<{ [id: string]: boolean; }> {
    throw new Error("Method not implemented.");
  }

  /*
   * @desc Busca todas as equipes filhas que pertencem a equipe pai vinculada ao usuário 
   * @return Lista de equipes
  */
  async hierarchy (...cdArr: number[]): Promise< CadEquipeEntity[] > {
    const { manager } = this.connection
    cdArr = cdArr.length === 0 ? [this.user.cdEquipe] : cdArr

    const teams = await manager.find(CadEquipeEntity, { where: { cd: In(cdArr) } })

    for (const team of teams) {
      if (!team.idEquipe.startsWith(this.user.idEquipe)) {
        throw new UnauthorizedException
      }
    }

    const startsWith = (idEquipe: string) => {
      for (const team of teams) {
        if (idEquipe.startsWith(team.idEquipe)) {
          return true
        }
      }
      return false
    }

    return (await this.connection.manager.find(CadEquipeEntity, { order: { idEquipe: 'ASC' } }))
      .filter(equipe => startsWith(equipe.idEquipe))
  }

  async teamsFromNonLeafTeams (cdArr: number[]): Promise<CadEquipeEntity[]> {
    const { manager } = this.connection
    return await manager.find(CadEquipeEntity, {
      where: {
        cdEquipePai: In(cdArr)
      }
    })
  }
  
  /*
   * @desc Busca todos os vendedores vinculados a uma equipe
   * @param Código da equipe desejada
   * @return Lista de vendedores
  */
  async sellersFromLeafTeams (cdArr: number[]): Promise<CadVendedorEntity[]> {
    const { manager } = this.connection
    return await manager.find(CadVendedorEntity, {
      where: {
        cdEquipe: In(cdArr)
      }
    })
  }
  
  /*
   * @desc Busca todos os vendedores vinculados a uma equipe (busca em subequipes)
   * @param Código da equipe desejada
   * @return Lista de vendedores
  */
  async sellersFromTeams (...cdArr: number[]): Promise<{
    entities: CadVendedorEntity[],
    cds: number[]
  }> {
    cdArr = cdArr.length === 0 ? [this.user.cdEquipe] : cdArr

    const teams = await this.hierarchy(...cdArr)
    const { manager } = this.connection
    const teamsCd = teams.map(team => team.cd)
    
    const entities = await manager.find(CadVendedorEntity, {
      cdEquipe: In(teamsCd)
    })

    return {
      entities,
      cds: entities.map(entity => entity.cd)
    }
  }

  /*
   * @desc Mesma funcionalidade que hierarchy(), porém o retorno é organizado em níveis
   * @return Lista de equipes organizadas em níveis
  */
  async hierarchyTree (): Promise< Array< Array<CadEquipeEntity> > > {
    const tree: Array<Array<CadEquipeEntity>> = [];
    (await this.hierarchy())
      .forEach(equipe => {
        const count = equipe.idEquipe.split('.').length - 1
        tree[count] = tree[count] ?? []
        tree[count].push(equipe)
      })
    const ret = []
    for (const key in tree) {
      ret.push(tree[key])
    }
    return ret
  }

  async teamsSellersFromTeam (cd: number): Promise<{
    parentTeam: {
      teamCode: number,
      teamId: string,
      teamName: string
    },
    childTeams: Array<{
      teamCode: number,
      teamId: string,
      teamName: string
    }>,
    childSellers: Array<{
      sellerCode: number,
      sellerName: string
    }>
  }> {
    const { manager } = this.connection
    const sellers = await manager.createQueryBuilder(CadVendedorEntity, 'vendedor')
      .select('vendedor.cd', 'sellerCode')
      .addSelect('vendedor.nmVendedor', 'sellerName')
      .where('vendedor.cdEquipe = :cdEquipe', { cdEquipe: cd })
      .getRawMany()
    const teams = await manager.createQueryBuilder(CadEquipeEntity, 'equipe')
      .select('equipe.cd', 'teamCode')
      .addSelect('equipe.idEquipe', 'teamId')
      .addSelect('equipe.nmEquipe', 'teamName')
      .where('equipe.cdEquipePai = :cdEquipePai OR equipe.cd = :cdEquipePai', { cdEquipePai: cd })
      .getRawMany()
    return {
      parentTeam: teams.splice(teams.findIndex(team => team.teamCode === cd), 1)[0],
      childTeams: teams,
      childSellers: sellers
    }
  }
}
