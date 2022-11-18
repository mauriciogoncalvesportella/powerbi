import {Column, Entity, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";

@Entity('cad_fabrica')
export class CadFabricaEntity {
  @PrimaryColumn('int')
  cd: number

  @Column({ length: 50 })
  idFabrica: string

  @Column({ length: 256 })
  nmFabrica: string

  @Column('numeric', { precision: 10, scale: 2 })
  vlMetaVenda: number

  @Column('smallint')
  nrLeadtimeCompra: number

  @Column('smallint')
  nrLeadtimeEntrega: number
}
