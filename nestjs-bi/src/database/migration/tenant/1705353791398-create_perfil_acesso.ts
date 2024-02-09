import { MigrationInterface, QueryRunner } from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

export class createPerfilAcesso1705353791398 implements MigrationInterface {
    name = 'createPerfilAcesso1705353791398'

    public async up(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(`CREATE TABLE "${schema}"."cad_perfil_acesso" ("cd" integer NOT NULL, "nome" text NOT NULL, "roles" text array NOT NULL, CONSTRAINT "PK_PERFIL_ACESSO" PRIMARY KEY ("cd"))`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "${schema}"."cad_perfil_acesso_cd_seq" OWNED BY "${schema}"."cad_perfil_acesso"."cd"`);
        await queryRunner.query(`ALTER TABLE "${schema}"."cad_perfil_acesso" ALTER COLUMN "cd" SET DEFAULT nextval('"${schema}"."cad_perfil_acesso_cd_seq"')`);

        const rowDirector = [
            0,
            'Padrão Diretor',
            [
                'sales.revenue.all',
                'sales.profit.all',
                'sales.markup.all',
                'sales.comparative.all',
                'sales.linearity.all',
                'sales.factory.all',
                'sales.category.all',
                'manage_users',
                'manage_users.roles'
            ]
        ]

        const rowSupervisor = [
            1,
            'Padrão Supervisor',
            [
                'sales.revenue.all',
                'sales.markup.all',
                'sales.comparative.all',
                'sales.linearity.all',
                'sales.factory.all',
                'sales.category.all',
                'manage_users',
            ]
        ]

        const rowSeller = [
            2,
            'Padrão Vendedor',
            [
                'sales.revenue',
                'sales.comparative',
                'sales.linearity',
                'sales.factory',
                'sales.category',
            ]
        ]

        await queryRunner.query(`
            INSERT INTO "${schema}"."cad_perfil_acesso" (cd, nome, roles)
            VALUES ($1, $2, $3)
        `, rowDirector);

        await queryRunner.query(`
            INSERT INTO "${schema}"."cad_perfil_acesso" (cd, nome, roles)
            VALUES ($1, $2, $3)
        `, rowSupervisor);

        await queryRunner.query(`
            INSERT INTO "${schema}"."cad_perfil_acesso" (cd, nome, roles)
            VALUES ($1, $2, $3)
        `, rowSeller);

        await queryRunner.query(`ALTER TABLE "${schema}"."cad_vendedor" ADD "cdPerfilAcesso" integer NOT NULL DEFAULT 2`);
        await queryRunner.query(`CREATE INDEX "IDX_CADVENDEDOR_CDPERFILACESSO" ON "${schema}"."cad_vendedor" ("cdPerfilAcesso") `);
        await queryRunner.query(`
        UPDATE "${schema}"."cad_vendedor"
        SET "cdPerfilAcesso" = CASE
            WHEN "fgFuncao" = 1 THEN 2
            WHEN "fgFuncao" = 2 THEN 1
            WHEN "fgFuncao" = 3 THEN 0
            WHEN "fgFuncao" = 4 THEN 1
            ELSE 2
        END;
        `)
        await queryRunner.query(`ALTER TABLE "${schema}"."cad_vendedor" ALTER COLUMN "cdPerfilAcesso" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(`DROP TABLE "${schema}"."cad_perfil_acesso"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_CADVENDEDOR_CDPERFILACESSO"`);
        await queryRunner.query(`ALTER TABLE "${schema}"."cad_vendedor" DROP COLUMN "cdPerfilAcesso"`);
    }
}
