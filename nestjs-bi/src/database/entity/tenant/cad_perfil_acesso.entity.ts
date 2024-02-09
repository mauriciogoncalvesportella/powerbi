import { IsArray, IsIBAN, IsInt, IsString } from "class-validator";
import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('cad_perfil_acesso')
export class CadPerfilAcesso {
  @PrimaryGeneratedColumn()
  @IsInt()
  cd: number;

  @Column('text')
  @IsString()
  nome: string;

  @Column('text', { array: true })
  roles: string[];
}