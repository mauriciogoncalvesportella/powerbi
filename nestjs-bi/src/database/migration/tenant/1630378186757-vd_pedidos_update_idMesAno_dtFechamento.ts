import {MigrationInterface, QueryRunner} from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

export class vd_pedidos_update_idMesAno_dtFechamento1630378186757 implements MigrationInterface {
    name = 'vd_pedidos_update_idMesAno_dtFechamento1630378186757'

    public async up(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(`
            update "${schema}".vd_pedidos vp set
                "idMesAno" = to_char(vp."dtEntrega" + interval '1 month', 'YYYY-MM')
            FROM "${schema}".cad_empresa ce
                where vp."cdEmpresa" = ce.cd
                and ce."dtFechamento" is not null
                and extract (day from vp."dtEntrega") between ce."dtFechamento" + 1 and 31
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
