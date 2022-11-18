import {MigrationInterface, QueryRunner} from "typeorm";

export class init1629686945049 implements MigrationInterface {
    name = 'init1629686945049'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "public"."cad_empresa_public" ("cd" SERIAL NOT NULL, "idEmpresa" character varying(256) NOT NULL, "idToken" text NOT NULL DEFAULT 'unauthorized', "idFantasia" character varying(50) NOT NULL, "nmRazao" character varying(70) NOT NULL, "idCnpj" character varying(14) NOT NULL, CONSTRAINT "UQ_IDCNPJ" UNIQUE ("idCnpj"), CONSTRAINT "UQ_IDEMPRESA" UNIQUE ("idEmpresa"), CONSTRAINT "PK_9f5069d3c0313f1a35605498174" PRIMARY KEY ("cd"))`);
        await queryRunner.query(`CREATE TABLE "public"."migration_log" ("cd" SERIAL NOT NULL, "id" character(256) NOT NULL, "dt" TIMESTAMP NOT NULL DEFAULT now(), "success" boolean, "errorId" character(256), "errorMessage" text, "query" text, CONSTRAINT "PK_c4674204a1d7548a1a7ba2a9d72" PRIMARY KEY ("cd"))`);
        await queryRunner.query(`CREATE TABLE "public"."cad_usuario" ("cdVendedor" integer NOT NULL, "idEmpresa" character varying(256) NOT NULL, "idEmail" character varying(256) NOT NULL, "idSenha" character varying(256), "idResetToken" character varying(128), "dtExpireToken" TIMESTAMP, "fgAtivo" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_IDEMAIL" UNIQUE ("idEmail"), CONSTRAINT "PK_38c2853ddc3c681dc8588036794" PRIMARY KEY ("cdVendedor", "idEmpresa"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "public"."cad_usuario"`);
        await queryRunner.query(`DROP TABLE "public"."migration_log"`);
        await queryRunner.query(`DROP TABLE "public"."cad_empresa_public"`);
    }

}
