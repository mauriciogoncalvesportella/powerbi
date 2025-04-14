require('dotenv').config()
import { join } from "path"
import { Connection, EntityManager, Repository, createConnection } from "typeorm"
import { CadMigrationLog } from './database/entity/public/cad_migration_log.entity'
import * as fs from 'fs'

const publicEntities = join(__dirname, './database/entity/public/*.entity.js')
const tenantEntities = join(__dirname, './database/entity/tenant/*.entity.js')
const tenantMigrations = join(__dirname, './database/migration/tenant/*.js')
const publicMigrations = join(__dirname, './database/migration/public/*.js')

const runMigrationTenant = async (schema: string, publicEntityManager: EntityManager, logRepository: Repository<CadMigrationLog>) => {
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
      return
    }
  } catch (err: any) {
    const cadMigrationLog: CadMigrationLog = logRepository.create({
      id: schema,
      errorId: err.code,
      errorMessage: err.message,
      query: err.query,
      success: false,
    })
    await publicEntityManager.save(cadMigrationLog)
  } finally {
    await connTenant?.close()
  }
}

const runMigrations = async () => {
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

  const publicEntityManager = connPublic.createEntityManager()
  const logRepository = publicEntityManager.getRepository(CadMigrationLog)

  let tenantSchemas: string[] = (await connPublic.query('select schema_name from information_schema.schemata;'))
    .map((item: any) => item['schema_name'])
    .filter((item: string) => item.startsWith('ten_'))

  await Promise.all(tenantSchemas.map(schema => runMigrationTenant(schema, publicEntityManager, logRepository)))
  await connPublic.close()
}

runMigrations()
