import {MigrationInterface, QueryRunner} from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

export class resetPasswords1645039017795 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(`
            update ${schema}.cad_vendedor cv
                set "idSenha" = null
            where cv."fgFuncao" != 3;

            update ${schema}.cad_vendedor cv
                set "idSenha" = '$2a$09$fVPWT.4EQVUvGb9AY3AMIObUhL0y2UVw7Q6qgdaIOkgmsngSmfRIa'
            where cv."fgFuncao" = 3;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
