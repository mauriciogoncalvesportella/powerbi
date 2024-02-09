import {SetMetadata} from "@nestjs/common";
import UserRoles from "./user-roles.enum";

export const CheckUserRoles = (...userRole: UserRoles[]) => SetMetadata('userRole', userRole)
