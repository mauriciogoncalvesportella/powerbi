import {Inject, Injectable, Provider, Scope} from "@nestjs/common";
import {REQUEST} from "@nestjs/core";
import {isInstance} from "class-validator";
import {addMonths, format, getDate} from "date-fns";
import {formatToTimeZone} from "date-fns-timezone";
import {utcToZonedTime} from "date-fns-tz";
import {Request} from "express";
import {BaseAuth} from "src/auth/auth.interfaces";
import {DatabaseService} from "src/database/database.service";
import {CadEmpresaPublicEntity} from "src/database/entity/public/cad_empresa_public.entity";
import {Equal} from "typeorm";

@Injectable({ scope: Scope.REQUEST })
export class RequestMetadata {
  private _idMesAno: string
  private _user: BaseAuth
  private _dtFechamento: number = -1

  constructor (
    @Inject(REQUEST)
    private request: Request,
    private dbService: DatabaseService
  ) {
    this._idMesAno = this.request.headers['id-mes-ano'] as string ?? formatToTimeZone(new Date(), 'yyyy-MM', { timeZone: 'America/Sao_Paulo' })
  }

  get idMesAno () {
    return this._idMesAno
  }

  get user () {
    return this._user
  }

  async dtFechamento (): Promise<number | null> {
    if (this._dtFechamento === -1) {
      const publicConn = await this.dbService.getConnection('public')
      const { dtFechamento } = await publicConn.manager.findOneOrFail(CadEmpresaPublicEntity, {
        where: {
          cd: Equal(this._user.cdEmpresaPublic)
        }
      })
      this._dtFechamento = dtFechamento
    }

    return this._dtFechamento
  }

  async getYearMonth (_date: Date | string | number): Promise<string> {
    let date: Date
    const dtFechamento = await this.dtFechamento()

    if (!isInstance(_date, Date)) {
      date = new Date(_date)
    } else {
      date = _date as Date
    }

    if (dtFechamento && getDate(date) > dtFechamento) {
      date = addMonths(date, 1)
    }

    return format(date, 'yyyy-MM')
  }

  set user (auth: BaseAuth) {
    this._user = auth
  }
}
