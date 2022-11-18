import {MigrationInterface, QueryRunner} from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

export class createFunctions1649191914402 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        let { schema } = queryRunner.connection.options as PostgresConnectionOptions
        await queryRunner.query(
        `
            CREATE OR REPLACE FUNCTION ${schema}.months_between(init_t text, end_t text) RETURNS integer AS $$
                begin
                    return (SELECT EXTRACT(YEAR FROM age) * 12 + EXTRACT(MONTH FROM age) AS months_between
                    FROM age((end_t||'-01')::timestamp, (init_t||'-01')::timestamp) AS t(age));
                end;
            $$ language plpgsql;
            
            CREATE OR REPLACE FUNCTION ${schema}.extract_year_month(dt timestamp) RETURNS text AS $$
                begin
                    return to_char(dt, 'YYYY-MM');
                end;
            $$ language plpgsql;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
