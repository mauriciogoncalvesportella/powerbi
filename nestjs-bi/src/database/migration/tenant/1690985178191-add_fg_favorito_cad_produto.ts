import {MigrationInterface, QueryRunner} from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

export class addFgFavoritoCadProduto1690985178191 implements MigrationInterface {
    name = 'addFgFavoritoCadProduto1690985178191'

    public async up(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(`ALTER TABLE "${schema}"."cad_produto" ADD COLUMN IF NOT EXISTS "fgFavorito" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_CADPRODUTO_FGFAVORITO" ON "${schema}"."cad_produto" ("fgFavorito") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_CADPRODUTO_FGFAVORITO"`);
        await queryRunner.query(`ALTER TABLE "${schema}"."cad_produto" DROP COLUMN "fgFavorito"`);
    }

}
