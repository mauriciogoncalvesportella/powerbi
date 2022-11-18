import {MigrationInterface, QueryRunner} from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

export class cad_equipe_meta_mensal_create_uq_idmesano_cdequipe1630375420940 implements MigrationInterface {
    name = 'cad_equipe_meta_mensal_create_uq_idmesano_cdequipe1630375420940'

    public async up(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(`ALTER TABLE "${schema}"."cad_equipe_meta_mensal" ADD CONSTRAINT "UQ_IDMESANO_CDEQUIPE" UNIQUE ("idMesAno", "cdEquipe")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(`ALTER TABLE "${schema}"."cad_equipe_meta_mensal" DROP CONSTRAINT "UQ_IDMESANO_CDEQUIPE"`);
    }
}
