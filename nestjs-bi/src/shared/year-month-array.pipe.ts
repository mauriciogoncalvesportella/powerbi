import {ArgumentMetadata, BadRequestException, Injectable, PipeTransform} from "@nestjs/common"; 
@Injectable()
export class YearMonthArrayValidationPipe implements PipeTransform<string[], string[]> {
  public transform (values: string[], metadata: ArgumentMetadata) {
    for (const value of values) { 
      if (value && value.match(/^\d{4}-\d{2}$/)) {
        const [, month] = value.split('-').map(it => parseInt(it))
        if (!(month >= 1 && month <= 12)) {
          throw new BadRequestException("Validation failed incorrect format 'idMesAno'")
        }
      }
    }
    return values
  }
}
