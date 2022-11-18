import {MigrationInterface, QueryRunner} from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

export class cadVendedorCreateIdSenha1644953438903 implements MigrationInterface {
    name = 'cadVendedorCreateIdSenha1644953438903'

    public async up(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(`ALTER TABLE "${schema}"."cad_vendedor" ADD "idSenha" character varying`);

        const [, id] = schema.split('_')
        await queryRunner.query(`
            UPDATE "${schema}".cad_vendedor cv
                SET "idSenha" = cuser."idSenha"
                FROM "public".cad_usuario cuser
            WHERE cuser."idEmpresa" = '${id}' and cuser."cdVendedor" = cv.cd
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(`ALTER TABLE "${schema}"."cad_vendedor" DROP COLUMN "idSenha"`);
    }
}
