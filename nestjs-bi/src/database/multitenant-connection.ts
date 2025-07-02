import { Connection, ObjectLiteral } from "typeorm";

export class MultitenantConnection {
  getManager(): import("typeorm").EntityManager {
    throw new Error('Method not implemented.');
  }
  constructor (
    public connection: Connection
  ) {}

  get tenant () {
    return `ten_${this.connection.name}`
  }

  get manager () {
    return this.connection.manager
  }

  public async queryExecute (sql: string, params: ObjectLiteral): Promise<any> {
    const [query, parameters] = this.connection.driver.escapeQueryWithParameters(sql, params, {})
    return await this.connection.query(query, parameters)
  }
}