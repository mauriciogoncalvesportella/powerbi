import { Inject, Injectable } from "@nestjs/common";
import { Connection, EntityManager, QueryRunner } from "typeorm";

@Injectable()
export class UnitOfWorkEntity extends EntityManager {
  constructor (
    @Inject('CONNECTION')
    connection: Connection
  ) {
    const queryRunner: QueryRunner = connection.createQueryRunner()
    super(connection, queryRunner)
  }
}
