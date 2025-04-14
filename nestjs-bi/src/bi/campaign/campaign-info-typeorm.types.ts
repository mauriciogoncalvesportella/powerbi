import { NotImplementedException } from "@nestjs/common";
import { SelectQueryBuilder } from "typeorm";
import { CadEmpresaEntity } from "src/database/entity/tenant/cad_empresa.entity";
import { CadVendedorEntity } from "src/database/entity/tenant/cad_vendedor.entity";
import { format } from 'date-fns';

export namespace GetCampaignTypeOrm {
  // Definição detalhada do tipo Raw
  export type Raw = {
    cd: number;
    nmCampanha: string;
    dtInicio: Date;
    dtFim: Date;
    fgSituacao: number;
    vlMeta: number;
    vlRealizado: number;
    empresa: Partial<CadEmpresaEntity> & {
      cd: number;
      nmRazao: string;
    };
    vendedor: Partial<CadVendedorEntity> & {
      cd: number;
      nmVendedor: string;
    };
  }

  // Classe abstrata de estratégia base
  export abstract class BaseStrategy {
    params: GetCampaign.BaseStrategy;
    abstract execute(qb: SelectQueryBuilder<Raw>): SelectQueryBuilder<Raw>;
  }

  // Função para selecionar estratégia
  export function electStrategy(params: GetCampaign.BaseStrategy): BaseStrategy {
    if (params instanceof GetCampaign.FromSellerStrategy)
      return new FromSeller(params)
    
    // Adicione outras estratégias conforme necessário
    throw new NotImplementedException()
  }

  // Estratégia de busca por vendedor
  export class FromSeller extends BaseStrategy {
    constructor(params: GetCampaign.FromSellerStrategy) {
      super()
      this.params = params
    }

    public execute(qb: SelectQueryBuilder<Raw>) {
      const params = this.params as GetCampaign.FromSellerStrategy
      const { sellerCode, dateParam } = params

      qb.andWhere('vendedor.cd = :sellerCode', { sellerCode })

      // Adicione filtros de data conforme necessário
      if (dateParam) {
        qb.andWhere('campanha.dtInicio >= :startDate AND campanha.dtFim <= :endDate', {
          startDate: dateParam[0],
          endDate: dateParam[1]
        })
      }

      return qb
    }
  }

  // Função de mapeamento para transformar dados brutos
  export function map(raw: Raw): GetCampaign.CampaignInfo {
    return {
      code: raw.cd,
      name: raw.nmCampanha,
      startDate: format(new Date(raw.dtInicio), 'yyyy-MM-dd'),
      endDate: format(new Date(raw.dtFim), 'yyyy-MM-dd'),
      status: raw.fgSituacao,
      seller: {
        code: raw.vendedor.cd,
        name: raw.vendedor.nmVendedor
      },
      company: {
        code: raw.empresa.cd,
        name: raw.empresa.nmRazao
      },
      values: {
        targetValue: raw.vlMeta,
        achievedValue: raw.vlRealizado
      }
    }
  }
}

// Namespace para definir estratégias e tipos
export namespace GetCampaign {
  export interface BaseStrategy {}

  export class FromSellerStrategy implements BaseStrategy {
    constructor(
      public sellerCode: number,
      public dateParam?: [string, string]
    ) {}
  }

  export interface CampaignInfo {
    code: number;
    name: string;
    startDate: string;
    endDate: string;
    status: number;
    seller: {
      code: number;
      name: string;
    };
    company: {
      code: number;
      name: string;
    };
    values: {
      targetValue: number;
      achievedValue: number;
    };
  }
}