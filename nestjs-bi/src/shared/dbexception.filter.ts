import {ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger} from "@nestjs/common";
import {DatabaseError} from "src/database/database.errors";
import {ImportDataError} from "src/import-data/import-data.errors";
import {RegistryError} from "src/registry/registry.errors";
// import {Response} from "express";
import {EntityNotFoundError, QueryFailedError} from "typeorm";

@Catch(QueryFailedError, ImportDataError, EntityNotFoundError, RegistryError, DatabaseError)
export class DBExceptionFilter implements ExceptionFilter { 
  catch(exception, host: ArgumentsHost) {
    Logger.error(exception.stack)

    let statusCode: number
    switch (exception.code) {
      case '23505': statusCode = HttpStatus.CONFLICT; break;
      default: statusCode = HttpStatus.BAD_REQUEST;
    }
    
    throw new HttpException({
      status: statusCode,
      error: 'Query Failed Error',
      message: exception.message,
    }, statusCode)
  }
}
