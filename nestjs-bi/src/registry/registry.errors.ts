export class RegistryError extends Error {
  constructor (message: string) {
    super(message)
  }
}

export class RegistryTenantDatabaseError extends RegistryError {
  constructor (message: string) {
    super(message)
  }
}
