import { UserCredential } from './auth.types'

export class AuthStateInterface {
  jwt?: string = undefined;
  user?: UserCredential = undefined;
  loginError?: string = undefined;
  loading: { [id: string]: boolean } = {};
}

function state (): AuthStateInterface {
  const jwt = localStorage.getItem('jwt') ?? undefined
  const user: UserCredential = JSON.parse(localStorage.getItem('user') ?? '{}') as UserCredential
  return {
    jwt,
    user,
    loginError: undefined,
    loading: {
      login: false
    }
  }
}

export default state
