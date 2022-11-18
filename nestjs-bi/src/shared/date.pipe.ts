import {ArgumentMetadata, BadRequestException, Injectable, PipeTransform} from "@nestjs/common";

@Injectable()
export class DateValidationPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata) {
    if (value && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return value
    }
    throw new BadRequestException("Validation failed incorrect format date, expected 'dd-MM-yyyy'")
  }
}
