export class DatabaseError extends Error {
  constructor (message: string) {
    super(message)
  }
}

export class CannotCreateTennant extends DatabaseError {
  constructor (message: string) {
    super(message)
  }
} 
