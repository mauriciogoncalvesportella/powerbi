import { BadRequestException, Injectable, NotImplementedException, Provider } from "@nestjs/common";
import { GetYearMonths } from "./get-year-months";
import { GetYearMonthsReturn } from "./types";
import { RequestMetadata } from "src/shared/request-metadata.provider";

@Injectable()
export class GetYearMonthsService {
  private semester = new GetYearMonths('semester')
  private monthly  = new GetYearMonths('monthly')
  private quartely = new GetYearMonths('quartely')
  private anualy   = new GetYearMonths('anualy')

  constructor (
    private requestMetadata: RequestMetadata
  ) { }

  async execute (type: 'semester' | 'monthly' | 'quartely' | 'anualy', yearMonth: string, iterations: number, iteration_mode: 'previous' | 'previous_years' | 'yearly'): Promise<GetYearMonthsReturn> {
    // const currentYearMonth = await this.requestMetadata.getYearMonth(new Date())
    let electedStrategy: GetYearMonths

    switch (type) {
      case 'anualy':   electedStrategy = this.anualy; break;
      case 'monthly':  electedStrategy = this.monthly; break;
      case 'quartely': electedStrategy = this.quartely; break;
      case 'semester': electedStrategy = this.semester; break;
      default: throw new BadRequestException("type must be one of 'semester', 'monthly', 'quartely', 'anualy'")
    }

    return electedStrategy.previous(iterations, yearMonth, iteration_mode)
  }
}
