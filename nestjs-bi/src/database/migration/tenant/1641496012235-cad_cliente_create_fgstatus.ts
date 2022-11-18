import {MigrationInterface, QueryRunner} from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

export class cadClienteCreateFgstatus1641496012235 implements MigrationInterface {
    name = 'cadClienteCreateFgstatus1641496012235'

    public async up(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(`ALTER TABLE ${schema}."cad_cliente" ADD "fgStatus" smallint NOT NULL DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(`ALTER TABLE ${schema}."cad_cliente" DROP COLUMN "fgStatus"`);
    }

}
