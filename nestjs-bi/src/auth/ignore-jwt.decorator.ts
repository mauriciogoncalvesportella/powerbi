import { SetMetadata } from "@nestjs/common";

export const IgnoreJwt = () => SetMetadata('ignore_jwt', true)
