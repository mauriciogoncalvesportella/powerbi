import { InternalServerErrorException, Provider, Scope, UnauthorizedException } from '@nestjs/common';
import {REQUEST} from '@nestjs/core';
import {JwtService} from '@nestjs/jwt';
import {Request} from 'express';
import {BaseAuth} from 'src/auth/auth.interfaces';
import { Connection} from 'typeorm';
import {DatabaseService} from './database.service';

export default {
  provide: 'CONNECTION',
  scope: Scope.REQUEST,
  useFactory: async (req: Request, jwtService: JwtService, dbService: DatabaseService): Promise<Connection> => {
    const token = req.headers['authorization'] as string
    let connectionId: string = 'public'

    if (token) {
      if (token?.startsWith('Bearer')) {
        try {
          var jwt = token.split(' ')[1]
          var auth = jwtService.decode(jwt) as BaseAuth
        } catch (err) {
          throw new InternalServerErrorException(err.message ?? err)
        }

        if (!auth || !jwtService.verify(jwt, { ignoreExpiration: true })) {
          throw new UnauthorizedException('Invalid credentials')
        }
        connectionId = auth.idEmpresa
      } else if (token !== process.env.REGISTRY_TOKEN){
        throw new UnauthorizedException('Invalid credentials')
      }
    }

    return await dbService.getConnection(connectionId)
  },
  inject: [REQUEST, JwtService, DatabaseService]
} as Provider
