import {Inject, Injectable} from "@nestjs/common";
import {TeamService} from "../team/team.service";
import {IFactoryGenerator, ResumeFactoryDTO, ResumeFactoryProductDTO, ResumeTeamByFactoryDTO } from "./factory.controller";
import {FactoryQueries} from "./factory.queries";
const _ = require('lodash')

export interface QueryResultResumeFactory {
  code: number,
  label: string,
  id: string,
  amount: number,
  quantity: number,
  total_orders: number
}

export interface QueryResultResumeTeamByFactory {
  code: number,
  label: string,
  amount: number,
  total_orders: number,
  type: 'seller' | 'team'
}

export interface IFactoryQueries {
  column: "nmCategoria" | "nmFabrica"
  resumePerSeller (cd: number, yearMonth: string): Promise<QueryResultResumeFactory[]>
  resumePerTeam (cd: number, yearMonth: string): Promise<QueryResultResumeFactory[]>
  resumeProduct (cd: number, cdFactory: number, yearMonth: string, type: 'seller' | 'team'): Promise<QueryResultResumeFactory[]>
  resumeTeamByFactory (cd: number, cdFactory: number, yearMonth: string): Promise<QueryResultResumeTeamByFactory[]>
}

@Injectable()
export class FactoryGenerator implements IFactoryGenerator {
  public menu: 'factory' | 'category'

  constructor ( 
    @Inject(FactoryQueries)
    private queries: IFactoryQueries,
  ) {
    this.queries.column = 'nmCategoria';
  }

  private setQueryColumn () {
    switch (this.menu) {
      case 'category': this.queries.column = 'nmCategoria'; break;
      case 'factory': this.queries.column = 'nmFabrica'; break;
      default: throw 'Invalid menu'; break; 
    }
  }

  async resume (cd: number, yearMonth: string, type: 'seller' | 'team'): Promise<ResumeFactoryDTO> {
    this.setQueryColumn()
    let queryResult: QueryResultResumeFactory[] = []
    if (type === 'team') {
      queryResult = await this.queries.resumePerTeam(cd, yearMonth)
    } else {
      queryResult = await this.queries.resumePerSeller(cd, yearMonth)
    }

    return {
      codes: _.map(queryResult, 'code'),
      labels: _.map(queryResult, 'label'),
      values: _.map(queryResult, 'amount'),
      total_orders: _.map(queryResult, 'order_count')
    }
  }

  async resumeProduct (cd: number, cdFactory: number, yearMonth: string, type: 'seller' | 'team'): Promise<ResumeFactoryProductDTO> {
    this.setQueryColumn()
    let queryResult: QueryResultResumeFactory[] = await this.queries.resumeProduct(cd, cdFactory, yearMonth, type)
    return {
      codes: _.map(queryResult, 'code'),
      ids: _.map(queryResult, 'id'),
      labels: _.map(queryResult, 'label'),
      values: _.map(queryResult, 'amount'),
      quantities: _.map(queryResult, 'quantity'),
      total_orders: _.map(queryResult, 'order_count')
    }
  }

  async resumeTeamByFactory (cd: number, cdFactory: number, yearMonth: string): Promise<ResumeTeamByFactoryDTO> {
    this.setQueryColumn()
    let queryResult: QueryResultResumeTeamByFactory[] = await this.queries.resumeTeamByFactory(cd, cdFactory, yearMonth)
    return {
      codes: _.map(queryResult, 'code'),
      labels: _.map(queryResult, 'label'),
      values: _.map(queryResult, 'amount'),
      total_orders: _.map(queryResult, 'order_count'), 
      types: _.map(queryResult, 'type')
    }
  }
}
