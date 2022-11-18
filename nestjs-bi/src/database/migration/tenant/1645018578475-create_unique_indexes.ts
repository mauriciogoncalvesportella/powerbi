import {MigrationInterface, QueryRunner} from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

export class createUniqueIndexes1645018578475 implements MigrationInterface {
    name = 'createUniqueIndexes1645018578475'

    public async up(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(`ALTER TABLE "${schema}"."cad_vendedor" ADD CONSTRAINT "UQ_efa241e1207bceb8b9856928651" UNIQUE ("idLogin")`);
        await queryRunner.query(`ALTER TABLE "${schema}"."cad_vendedor_meta_mensal" ADD CONSTRAINT "UQ_VENDEDORMETAMENSAL_IDMESANO_CDEQUIPE" UNIQUE ("idMesAno", "cdVendedor")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(`ALTER TABLE "${schema}"."cad_vendedor_meta_mensal" DROP CONSTRAINT "UQ_VENDEDORMETAMENSAL_IDMESANO_CDEQUIPE"`);
        await queryRunner.query(`ALTER TABLE "${schema}"."cad_vendedor" DROP CONSTRAINT "UQ_efa241e1207bceb8b9856928651"`);
    }
}
