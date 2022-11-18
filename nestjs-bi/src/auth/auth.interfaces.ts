export type RolesAuth = 'commerce' | 'user'

export interface BaseAuth {
  role: RolesAuth;
  cdEmpresaPublic: number;
  idEmpresa: string;
  idCnpj: string;
}

export interface CommerceAuth extends BaseAuth {}
export interface UserAuth extends BaseAuth {
  cdEquipe: number
  cdVendedor: number
  idEquipe: string
  fgResponsavel: boolean
  dtFechamento: number
  nmVendedor: string
  idEmail: string
  fgFuncao: number
  expiresIn: number
}
