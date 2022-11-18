import {BeforeInsert, Column, Entity, PrimaryColumn, Unique} from "typeorm";
import * as bcrypt from 'bcryptjs'

@Entity({ schema: 'public', name: 'cad_usuario' })
@Unique('UQ_CDVENDEDOR_CDEMPRESA', ['idEmpresa', 'cdVendedor'])
export class CadUsuarioPublicEntity {
  @PrimaryColumn('int')
  cdVendedor: number

  @PrimaryColumn('varchar', { length: 256 })
  idEmpresa: string

  @Column('varchar', { length: 256, nullable: true })
  idSenha: string

  @Column('varchar', { length: 256, nullable: true })
  idLogin: string

  @Column('varchar', { length: 128, nullable: true })
  idResetToken: string

  @Column('timestamp', { nullable: true })
  dtExpireToken: string

  @Column('boolean', { default: false })
  fgAtivo: boolean

  static async hashPassword (idSenha: string) {
    return await bcrypt.hash(idSenha, 10)
  }

  static async comparePassword (attempt: string, hash: string) {
    return await bcrypt.compare(attempt, hash)
  } 
}
