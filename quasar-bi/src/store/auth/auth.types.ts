export interface UserCredential {
  role: string;
  cdEmpresaPublic: number;
  cdVendedor: number;
  idEmpresa: string;
  idCnpj: string;
  cdEquipe: number;
  idEquipe: number;
  fgResponsavel: boolean;
  dtFechamento: number
}

export interface loginDTO {
  credentials: UserCredential,
  jwt: string,
}
