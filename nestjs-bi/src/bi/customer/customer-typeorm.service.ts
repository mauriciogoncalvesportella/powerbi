import {Inject, Injectable} from "@nestjs/common";
import {CadClienteEntity} from "src/database/entity/tenant/cad_cliente.entity";
import {Connection, EntityManager} from "typeorm";
import {Customer, ICustomerService} from "./customer.controller";

@Injectable()
export class CustomerTypeOrmService implements ICustomerService {
  private manager: EntityManager

  constructor (
    @Inject('CONNECTION')
    connection: Connection,
  ) {
    this.manager = connection.manager
  }

  private mapToCustomer (customer: CadClienteEntity): Customer {
    return {
      code: customer.cd,
      customerId: customer.idCliente,
      cnpjOrCpfCode: customer.idCnpjCpf,
      companyName: customer.nmRazao,
      tradingName: customer.idFantasia,
      sellerCode: customer.cdVendedor,
      districtName: customer.nmBairro,
      cityName: customer.nmCidade,
      stateName: customer.idEstado,
      phoneId: customer.idFone,
      phone2Id: customer.idFone2,
      mobilePhoneId: customer.idCelular,
      creditLimitValue: customer.vlLimiteCredito,
      discontValue: customer.vlDesconto,
      status: customer.fgStatus
    }
  }

  public async getCustomerByCode(code: number): Promise<Customer> {
    const customer = await this.manager.findOneOrFail(CadClienteEntity, code)
    return this.mapToCustomer(customer)
  }
}
