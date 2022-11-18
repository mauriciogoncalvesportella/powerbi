import {ArgumentMetadata, BadRequestException, Injectable, PipeTransform} from "@nestjs/common";

export class IdMesAnoValidationPipe implements PipeTransform<string, string> {
  constructor (
    private optional: boolean = false
  ) {  }

  transform(value: string, metadata: ArgumentMetadata) {
    if (!this.optional && value && value.match(/^\d{4}-\d{2}$/)) {
      const [, month] = value.split('-').map(it => parseInt(it))
      if (month >= 1 && month <= 12) {
        return value
      }
    } else if (this.optional) {
      throw new BadRequestException("Validation failed incorrect format 'idMesAno'")
    } else {
      return ''
    }
  }
}
