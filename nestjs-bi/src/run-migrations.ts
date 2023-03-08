require('dotenv').config()
import { join } from "path"
import { Connection, createConnection } from "typeorm"
import { CadMigrationLog } from './database/entity/public/cad_migration_log.entity'
import * as fs from 'fs'

const runMigrations = async () => {
  const publicEntities = join(__dirname, './database/entity/public/*.entity.js')
  const tenantEntities = join(__dirname, './database/entity/tenant/*.entity.js')
  const tenantMigrations = join(__dirname, './database/migration/tenant/*.js')
  const publicMigrations = join(__dirname, './database/migration/public/*.js')

  const connPublic = await createConnection({
    type: 'postgres',
    url: process.env.DB_URL,
    name: 'public',
    migrationsRun: false,
    synchronize: false,
    entities: [publicEntities],
    migrations: [publicMigrations],
    ssl: process.env.PROD ? { ca: fs.readFileSync(__dirname + '/database/ca-certificate.crt'), rejectUnauthorized: false } : false,
    extra: {
      ssl: process.env.PROD ? true : false,
    },
  })

  const manPublic = connPublic.createEntityManager()
  const logRepository = manPublic.getRepository(CadMigrationLog)

  let tenantSchemas: string[] = (await connPublic.query('select schema_name from information_schema.schemata;'))
    .map((item: any) => item['schema_name'])
    .filter((item: string) => item.startsWith('ten_'))

  for (const schema of tenantSchemas) {
    let connTenant: Connection
    try {
      connTenant = await createConnection({
        type: 'postgres',
        url: process.env.DB_URL,
        schema: schema,
        entities: [tenantEntities],
        migrations: [tenantMigrations],
        synchronize: false,
        migrationsRun: false,
        ssl: process.env.PROD ? { ca: fs.readFileSync(__dirname + '/database/ca-certificate.crt'), rejectUnauthorized: false } : false,
        extra: {
          ssl: process.env.PROD ? true : false,
        }
      })

      if (await connTenant.showMigrations()) {
        await connTenant.runMigrations()
        console.log(schema,'updated')
      }

      console.log(schema, 'continue')
    } catch (err: any) {
      console.log(schema, err.message)
      const cadMigrationLog: CadMigrationLog = logRepository.create({
        id: schema,
        errorId: err.code,
        errorMessage: err.message,
        query: err.query,
        success: false,
      })
      await manPublic.save(cadMigrationLog)
    } finally {
      await connTenant?.close()
    }
  }

  await connPublic.close()
}

runMigrations()
