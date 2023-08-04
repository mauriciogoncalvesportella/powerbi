import {MigrationInterface, QueryRunner} from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

export class addVdPedidosVendedor21668800454599 implements MigrationInterface {
    name = 'addVdPedidosVendedor21668800454599'

    public async up(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(`ALTER TABLE "${schema}"."vd_pedidos" ADD "cdVendedor2" integer`);
        await queryRunner.query(`CREATE INDEX "IDX_VDPEDIDOS_CDVENDEDOR_2" ON "${schema}"."vd_pedidos" ("cdVendedor2") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_VDPEDIDOS_CDVENDEDOR_2"`);
        await queryRunner.query(`ALTER TABLE "${schema}"."vd_pedidos" DROP COLUMN "cdVendedor2"`);
    }
}
