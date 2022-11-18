import {MigrationInterface, QueryRunner} from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

export class createCadVendedorMetaMensal1638825316059 implements MigrationInterface {
    name = 'createCadVendedorMetaMensal1638825316059'

    public async up(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(`CREATE TABLE ${schema}."cad_vendedor_meta_mensal" ("idMesAno" character varying(7) NOT NULL, "cdVendedor" integer NOT NULL, "vlMetaVenda" numeric(10,2) NOT NULL, "vlBonusMetaVenda" numeric(10,2) NOT NULL, "pcBonusMetaVenda" numeric(5,2) NOT NULL, CONSTRAINT "UQ_IDMESANO_CDEQUIPE" UNIQUE ("idMesAno", "cdVendedor"), CONSTRAINT "PK_0afca8ad306cb2463e83ed2c787" PRIMARY KEY ("idMesAno", "cdVendedor"))`);
        await queryRunner.query(`CREATE INDEX "IDX_50513de71f65fb09f062e71805" ON ${schema}."cad_vendedor_meta_mensal" ("idMesAno") `);
        await queryRunner.query(`CREATE INDEX "IDX_1c91bbd83f2971ca65cb528cf5" ON ${schema}."cad_vendedor_meta_mensal" ("cdVendedor") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(`DROP INDEX ${schema}."IDX_1c91bbd83f2971ca65cb528cf5"`);
        await queryRunner.query(`DROP INDEX ${schema}."IDX_50513de71f65fb09f062e71805"`);
        await queryRunner.query(`DROP TABLE ${schema}."cad_vendedor_meta_mensal"`);
    }
}
