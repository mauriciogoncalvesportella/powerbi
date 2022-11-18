import {Inject, Injectable} from "@nestjs/common";
import {RequestMetadata} from "src/shared/request-metadata.provider";
import {Connection, EntityManager} from "typeorm";

@Injectable()
export class MarkupQueries {
  protected manager: EntityManager

  constructor(
    @Inject('CONNECTION')
    public connection: Connection,
    public requestMetadata: RequestMetadata
  ) {
    this.manager = connection.manager
  }
}
