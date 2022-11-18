import {MigrationInterface, QueryRunner} from "typeorm";

export class cadEmpresaPublicCreateDtfechamento1630449487130 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."cad_empresa_public" ADD "dtFechamento" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."cad_empresa_public" DROP COLUMN "dtFechamento"`);
    }
}
