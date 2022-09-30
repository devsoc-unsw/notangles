import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export default class TimeFormatValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    console.log(value);
    console.log(metadata);
  }
}
