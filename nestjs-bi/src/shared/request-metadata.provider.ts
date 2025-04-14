import { Injectable, Inject, Scope, Logger } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class RequestMetadata {
  public user: any; // Propriedade user que é acessada em vários lugares
  
  constructor(
    @Inject(REQUEST)
    private readonly request: Request
  ) {}

  /**
   * Obtém o ID do tenant da requisição atual
   * @returns O ID do tenant
   */
  getTenantId(): string {
    const id: string = this.request.headers['x-tenant-id'] as string    
    return id
  }

  /**
   * Obtém o objeto de requisição completo
   * @returns O objeto Request
   */
  getRequest(): Request {
    return this.request;
  }

  /**
   * Obtém um cabeçalho específico da requisição
   * @param name Nome do cabeçalho
   * @returns Valor do cabeçalho
   */
  getHeader(name: string): string | undefined {
    return this.request.headers[name.toLowerCase()] as string | undefined;
  }

  /**
   * Retorna a data de fechamento
   * @returns Data de fechamento como número (timestamp ou outro formato numérico)
   */
  async dtFechamento(): Promise<number> {
    // Retornando o timestamp em milissegundos (conforme esperado pelo código)
    return new Date().getTime(); 
  }

  /**
   * Obtém o ano/mês a partir de uma data ou string
   * @param dateOrString Data ou string para extrair o ano/mês
   * @returns String no formato YYYYMM
   */
  async getYearMonth(dateOrString: Date | string): Promise<string> {
    let date: Date;
    
    if (typeof dateOrString === 'string') {
      // Se for uma string, tenta converter para Date
      date = new Date(dateOrString);
    } else {
      date = dateOrString;
    }
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Mês começa em 0
    return `${year}${month.toString().padStart(2, '0')}`;
  }

  /**
   * Verifica se existe um tenant ID na requisição
   * @returns true se existir, false caso contrário
   */
  hasTenantId(): boolean {
    return !!this.getTenantId();
  }
}