import {IsIn, IsInt, IsISO8601, IsNumber, IsOptional, IsString} from "class-validator";
import {Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";

@Entity('cad_cliente')
export class CadClienteEntity {
  @PrimaryColumn('int')
  @IsInt()
  cd: number

  @Column({ length: 50 })
  @IsString()
  idCliente: string

  @Column({ length: 50 })
  @IsString()
  idCnpjCpf: string

  @Column({ length: 50 })
  @IsString()
  idFantasia: string

  @Column({ length: 256 })
  @IsString()
  nmRazao: string

  @Column('integer', { nullable: true })
  @IsInt()
  @IsOptional()
  cdVendedor: number

  @Column({ length: 256 })
  @IsString()
  nmBairro: string

  @Column({ length: 256 })
  @IsString()
  nmCidade: string

  @Column({ length: 50 })
  @IsString()
  idEstado: string

  @Column({ length: 256 })
  @IsString()
  nmContato: string

  @Column({ length: 50 })
  @IsString()
  idFone: string

  @Column({ length: 50 })
  @IsString()
  idFone2: string

  @Column({ length: 50 })
  @IsString()
  idCelular: string

  @Column('numeric', { precision: 10, scale: 2 })
  @IsNumber()
  vlLimiteCredito: number

  @Column('numeric', { precision: 10, scale: 2 })
  @IsNumber()
  vlDesconto: number

  @Column('numeric', { precision: 10, scale: 2 })
  @IsNumber()
  vlRapel: number

  @Column('timestamp without time zone', { nullable: true })
  @IsISO8601()
  dtCriacao: string

  @Column('timestamp without time zone', { nullable: true })
  @IsISO8601()
  dtAtualizacao: string

  @Column('smallint', { default: 1 })
  @IsNumber()
  fgStatus: number
}
