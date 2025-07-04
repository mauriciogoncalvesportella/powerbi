import { IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString } from "class-validator";
import { BeforeInsert, Column, Entity, In, Index, PrimaryColumn, Unique } from "typeorm";
import * as bcrypt from 'bcryptjs'

@Entity('cad_vendedor')
@Unique('UQ_CADVENDEDOR_IDLOGIN', ['idLogin'])
export class CadVendedorEntity {
  @PrimaryColumn('int')
  @IsInt()
  cd: number

  @Column('int')
  @Index('IDX_CADVENDEDOR_CDEQUIPE')
  @IsInt()
  cdEquipe: number

  @Column('int')
  @Index('IDX_CADVENDEDOR_CDPERFILACESSO')
  @IsInt()
  @IsOptional()
  cdPerfilAcesso: number

  @Column({ length: 50 })
  @IsString()
  idVendedor: string

  @Column('varchar', { nullable: true })
  @IsOptional()
  @IsString()
  idSenha: string

  @Column({ length: 50 })
  @IsString()
  nmVendedor: string

  @Column({ length: 256 })
  @IsString()
  @IsOptional()
  idEmail: string

  @Column({ length: 32, nullable: true })
  @IsOptional()
  @IsString()
  idLogin: string

  @Column('boolean')
  @IsBoolean()
  fgAtivo: boolean

  @Column('smallint')
  @IsInt()
  fgFuncao: number

  @Column('json', { nullable: true })
  jsMetaMensal: any

  @Column('numeric', { precision: 10, scale: 2 })
  @IsNumber()
  vlMetaMensal: number

  @BeforeInsert()
  beforeInsert () {
    switch (this.fgFuncao) {
      case 1: this.cdPerfilAcesso = 2; break;
      case 2: this.cdPerfilAcesso = 1; break;
      case 3: this.cdPerfilAcesso = 0; break;
      case 4: this.cdPerfilAcesso = 1; break;
      default: 2;
    }
    this.jsMetaMensal = this.jsMetaMensal ?? {}
  }

  static async hashPassword (idSenha: string) {
    return await bcrypt.hash(idSenha, 10)
  }

  static async comparePassword (attempt: string, hash: string) {
    return await bcrypt.compare(attempt, hash)
  } 
}
