import {MigrationInterface, QueryRunner} from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

export class cadVendedorMetaMensalChangeColumnsDefault1652289237717 implements MigrationInterface {
    name = 'cadVendedorMetaMensalChangeColumnsDefault1652289237717'

    public async up(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(`ALTER TABLE "${schema}"."cad_vendedor_meta_mensal" ALTER COLUMN "vlMetaVenda" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "${schema}"."cad_vendedor_meta_mensal" ALTER COLUMN "vlBonusMetaVenda" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "${schema}"."cad_vendedor_meta_mensal" ALTER COLUMN "pcBonusMetaVenda" SET DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(`ALTER TABLE "${schema}"."cad_vendedor_meta_mensal" ALTER COLUMN "pcBonusMetaVenda" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "${schema}"."cad_vendedor_meta_mensal" ALTER COLUMN "vlBonusMetaVenda" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "${schema}"."cad_vendedor_meta_mensal" ALTER COLUMN "vlMetaVenda" DROP DEFAULT`);
    }
}
