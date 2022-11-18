import {forwardRef, Inject, Injectable} from "@nestjs/common";
import {UserStatusService} from "src/auth/user-status/user-status.service";
import {CadVendedorEntity} from "src/database/entity/tenant/cad_vendedor.entity";
import {UnitOfWorkEntity} from "src/database/unit-of-work/uow.provider";
import {IImportData} from "../import-data.interface";
import {ImportDataService} from "../import-data.service";
import {IDSEquipe} from "./ids-equipe";

type MyEntity = CadVendedorEntity

@Injectable()
export class IDSVendedor extends ImportDataService<MyEntity> implements IImportData<MyEntity> {
  constructor (
    unitOfWorkEntity: UnitOfWorkEntity,
    @Inject(forwardRef(() => IDSEquipe))
    private idsEquipe: IDSEquipe,
    private userStatusService: UserStatusService 
  ) {
    super(unitOfWorkEntity, CadVendedorEntity)
  }

  public async importData(entities: MyEntity[]) {
    for (const entity of entities) {
      await this.idsEquipe.has(entity.cdEquipe)
      if ((await this.unitOfWorkEntity.findOne(CadVendedorEntity, entity.cd)) != undefined) {
        await this.unitOfWorkEntity.save(entity)
      } else {
        await this.unitOfWorkEntity.save(CadVendedorEntity, {
          ...entity,
          idSenha: entity.fgFuncao === 3
            ? await CadVendedorEntity.hashPassword('bi@admin')
            : null// (await CadVendedorEntity.hashPassword(nanoid(5)))
        })
      }
      await this.userStatusService.updateStatus(entity.cd, true)
    }
  }
}
