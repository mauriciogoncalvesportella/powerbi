import {Injectable} from "@nestjs/common";
import {DatabaseService} from "src/database/database.service";
import {CadUsuarioPublicEntity} from "src/database/entity/public/cad_usuario_public.entity";
import {CadVendedorEntity} from "src/database/entity/tenant/cad_vendedor.entity";
import {RequestMetadata} from "src/shared/request-metadata.provider";

@Injectable()
export class RegistryUsuarioService {
  constructor (
    private requestMetadata: RequestMetadata,
    private dbService: DatabaseService,
  ) {  }

  public async registry (vendedorEntity: CadVendedorEntity) {
    const { manager } = await this.dbService.getConnection('public')
    const usuarioEntity: any = {
      cdVendedor: vendedorEntity.cd,
      idEmpresa: this.requestMetadata.user.idEmpresa,
      idEmail: vendedorEntity.idEmail,
      idSenha: await CadUsuarioPublicEntity.hashPassword('123'),
      fgAtivo: false,
    }
    await manager.save(CadUsuarioPublicEntity, usuarioEntity)
    // await manager.connection.close()
  }
}
