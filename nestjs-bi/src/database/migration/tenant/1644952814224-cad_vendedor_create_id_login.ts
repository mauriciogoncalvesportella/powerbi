import {MigrationInterface, QueryRunner} from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

export class cadVendedorCreateIdLogin1644952814224 implements MigrationInterface {
    name = 'cadVendedorCreateIdLogin1644952814224'

    public async up(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(`ALTER TABLE "${schema}"."cad_vendedor" ADD "idLogin" character varying(32)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(`ALTER TABLE "${schema}"."cad_vendedor" DROP COLUMN "idLogin"`);
    }

}
