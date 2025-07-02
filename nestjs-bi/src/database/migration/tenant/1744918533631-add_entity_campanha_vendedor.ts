import { MigrationInterface, QueryRunner } from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

export class addEntityCampanhaVendedor1744918533631 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions;

        // Tabela cad_campanha: Adicionar colunas
        await queryRunner.query(`
            ALTER TABLE ${schema}.cad_campanha
            ADD COLUMN "qtDiasRef" INT,
            ADD COLUMN "vlPercRef" NUMERIC(10, 2);
        `);

        // Tabela cad_campanha_produto: Adicionar coluna
        await queryRunner.query(`
            ALTER TABLE ${schema}.cad_campanha_produto
            ADD COLUMN "qtProdutoRef" SMALLINT;
        `);

        // Tabela cad_campanha_vendedor: Criar tabela
        await queryRunner.query(`
            CREATE TABLE ${schema}.cad_campanha_vendedor (
                "cd" INT NOT NULL,
                "cdCampanha" INT NOT NULL,
                "cdProduto" INT NOT NULL,
                "cdVendedor" INT NOT NULL,
                "qtProduto" SMALLINT NOT NULL,
                "vlMetafat" NUMERIC(10, 2) NOT NULL,
                CONSTRAINT "PK_cad_campanha_vendedor" PRIMARY KEY ("cd"),
                CONSTRAINT "FK_cad_campanha_vendedor_cdCampanha" FOREIGN KEY ("cdCampanha") REFERENCES ${schema}.cad_campanha("cd"),
                CONSTRAINT "FK_cad_campanha_vendedor_cdProduto" FOREIGN KEY ("cdProduto") REFERENCES ${schema}.cad_produto("cd"),
                CONSTRAINT "FK_cad_campanha_vendedor_cdVendedor" FOREIGN KEY ("cdVendedor") REFERENCES ${schema}.cad_vendedor("cd")
            );
        `);

        // Criar Índices (separadamente)
        await queryRunner.query(`
            CREATE INDEX "IDX_CADCAMPANHAVEND_CDCAMPANHA" ON ${schema}.cad_campanha_vendedor ("cdCampanha");
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_CADCAMPANHAVEND_CDPRODUTO" ON ${schema}.cad_campanha_vendedor ("cdProduto");
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_CADCAMPANHAVEND_CDVENDEDOR" ON ${schema}.cad_campanha_vendedor ("cdVendedor");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions;

        // Reverter: Dropar Índices (IMPORTANTE: Ordem inversa do up())
        await queryRunner.query(`
            DROP INDEX IF EXISTS ${schema}.IDX_CADCAMPANHAVEND_CDVENDEDOR;
        `);
        await queryRunner.query(`
            DROP INDEX IF EXISTS ${schema}.IDX_CADCAMPANHAVEND_CDPRODUTO;
        `);
        await queryRunner.query(`
            DROP INDEX IF EXISTS ${schema}.IDX_CADCAMPANHAVEND_CDCAMPANHA;
        `);

        // Reverter a criação da tabela (IMPORTANTE: Ordem inversa do up())
        await queryRunner.query(`
            DROP TABLE IF EXISTS ${schema}.cad_campanha_vendedor;
        `);

        // Reverter a adição da coluna na tabela cad_campanha_produto
        await queryRunner.query(`
            ALTER TABLE ${schema}.cad_campanha_produto
            DROP COLUMN IF EXISTS "qtProdutoRef";
        `);

        // Reverter a adição das colunas na tabela cad_campanha
        await queryRunner.query(`
            ALTER TABLE ${schema}.cad_campanha
            DROP COLUMN IF EXISTS "qtDiasRef",
            DROP COLUMN IF EXISTS "vlPercRef";
        `);
    }
}