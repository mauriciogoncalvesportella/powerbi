import {MigrationInterface, QueryRunner} from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

export class cadEquipeMetaMensalCreatePcMetaMarkup1631209284991 implements MigrationInterface {
    name = 'cadEquipeMetaMensalCreatePcMetaMarkup1631209284991'

    public async up(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(`ALTER TABLE "${schema}"."cad_equipe_meta_mensal" ADD "pcMetaMarkup" numeric(5,2) NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(`ALTER TABLE "${schema}"."cad_equipe_meta_mensal" DROP COLUMN "pcMetaMarkup"`);
    }
}
