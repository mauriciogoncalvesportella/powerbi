import { Injectable } from "@nestjs/common";
import { join } from "path";
import { createConnection, getConnectionManager } from "typeorm";
import * as fs from 'fs'

@Injectable()
export class DatabaseService {
  async getConnection (schemaId: string) {
    const connectionManager = getConnectionManager()

    if (connectionManager.has(schemaId)) {
      const connection = connectionManager.get(schemaId)
      if (connection.isConnected) {
        return connection
      } else {
        return await connection.connect()
      }
    }

    const publicEntities = join(__dirname, './entity/public/*.entity.js')
    const tenantEntities = join(__dirname, './entity/tenant/*.entity.js')
    const tenantMigrations = join(__dirname, './migration/tenant/*.js')

    const connection = await createConnection({
      type: 'postgres',
      url: process.env.DB_URL,
      name: schemaId,
      schema: `ten_${schemaId}`,
      entities: schemaId === 'public' ? [publicEntities] : [tenantEntities],
      migrations: schemaId === 'public' ? [] : [tenantMigrations],
      synchronize: false,
      ssl: process.env.PROD ? { ca: fs.readFileSync(__dirname + '/ca-certificate.crt'), rejectUnauthorized: false } : false,
      extra: {
        ssl: process.env.PROD ? true : false,
      }
    })

    return connection
  }
}
