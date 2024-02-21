import { MigrationInterface, QueryRunner } from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

export class cadEquipeNmequipe2561708523556965 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(`ALTER TABLE ${schema}.cad_equipe ALTER COLUMN "nmEquipe" TYPE varchar(256) USING "nmEquipe"::varchar(256);`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
