import { SetMetadata } from "@nestjs/common";

export const UserRole = (role: string) => SetMetadata('user_role', role)
