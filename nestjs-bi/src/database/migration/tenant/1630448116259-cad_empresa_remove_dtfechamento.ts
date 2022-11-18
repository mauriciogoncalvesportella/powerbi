import {MigrationInterface, QueryRunner} from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

export class cadEmpresaRemoveDtfechamento1630448116259 implements MigrationInterface {
    name = 'cadEmpresaRemoveDtfechamento1630448116259'

    public async up(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(`ALTER TABLE "${schema}"."cad_empresa" DROP COLUMN "dtFechamento"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(`ALTER TABLE "${schema}"."cad_empresa" ADD "dtFechamento" integer`);
    }
}
