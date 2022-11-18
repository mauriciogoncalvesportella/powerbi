export class ImportDataError extends Error {
  constructor (message: string) {
    super(message)
  }
}

export class IDNotFoundError extends ImportDataError {
  constructor (message: string) {
    super(message)
  }
}
