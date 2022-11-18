import {SetMetadata} from "@nestjs/common";
import {RolesAuth} from './auth.interfaces'

export const Role = (role: RolesAuth) => SetMetadata('role', role)
