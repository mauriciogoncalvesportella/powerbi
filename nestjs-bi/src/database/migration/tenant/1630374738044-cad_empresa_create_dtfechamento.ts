import {MigrationInterface, QueryRunner} from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

export class cadEmpresaCreateDtfechamento1630374738044 implements MigrationInterface {
    name = 'cadEmpresaCreateDtfechamento1630374738044'

    public async up(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(`ALTER TABLE "${schema}"."cad_empresa" ADD "dtFechamento" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(`ALTER TABLE "${schema}"."cad_empresa" DROP COLUMN "dtFechamento"`);
    }

}
