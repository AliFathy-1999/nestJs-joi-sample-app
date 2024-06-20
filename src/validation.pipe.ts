import { BadRequestException, Injectable, PipeTransform, Type } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { getClassSchema } from 'joi-class-decorators';

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;
    const bodyDto = metatype; // Dto Schema
    console.log('bodyDto:', bodyDto)
    /*
      To transform our plain JavaScript argument object into a typed object so that we can apply validation.
      The reason we must do this is that the incoming post body object, when deserialized from the network request, does not have any type information. 
    */
    
    // getClassSchema(bodyDto) ==> A function from joi-class-decorators to retrieve the Joi validation schema associated with a class.
    console.log('value:', value)
    const bodyInput = plainToInstance(bodyDto, value); // Convert plain Dto object to instance to transform it manually
    console.log('bodyInput:', bodyInput)
    const bodySchema = getClassSchema(bodyDto); // Get Joi Schema from Dto
    console.log('bodySchema:', bodySchema)
    // Validates the class instance against the Joi schema. If validation fails, error will contain the validation errors.
    const error = bodySchema.validate(bodyInput).error;  
    console.log('error:', error)
    if (error) {
      throw new BadRequestException(`Validation failed: ${error.details.map((err) => err.message).join(', ')}.`);  
    }
    return value
  }
}
interface ArgumentMetadata {
  type: 'body' | 'query' | 'param' | 'custom';
  metatype?: Type<unknown>;
  data?: string;
}