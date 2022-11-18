import {Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn, Unique} from "typeorm";

@Entity({ schema: 'public', name: 'migration_log' })
export class CadMigrationLog {
  @PrimaryGeneratedColumn()
  cd: number

  @Column('char', { length: 256 })
  id: string

  @CreateDateColumn()
  dt: string

  @Column('boolean', { nullable: true })
  success: boolean

  @Column('char', { length: 256, nullable: true })
  errorId: string

  @Column('text', { nullable: true })
  errorMessage: string

  @Column('text', { nullable: true })
  query: string
}
