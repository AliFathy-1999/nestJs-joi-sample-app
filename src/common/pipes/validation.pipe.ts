import {
  BadRequestException,
  Injectable,
  PipeTransform,
  ArgumentMetadata,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { getClassSchema } from 'joi-class-decorators';
import { localizeMessage } from '../utils/localization.util';
import { Lang } from '../enum/localization.enum';

/**
 * ValidationPipe: Handles Joi-based validation for DTOs.
 *
 * - Transforms plain objects to DTO instances for Joi schema resolution
 * - Validates against Joi schemas and throws localized BadRequestExceptions
 * - Builds localization keys from Joi error paths and types
 * - Supports nested arrays by replacing indices with 'item'
 */
@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;
    const location = metadata.type || 'body';

    // Transform to DTO instance for Joi decorators
    const dtoObject = plainToInstance(metatype, value);
    const schema = getClassSchema(metatype);

    if (!schema) {
      return dtoObject;
    }

    const { error } = schema.validate(dtoObject, {
      abortEarly: true,
      allowUnknown: false,
    });

    if (!error) {
      return dtoObject;
    }

    const joiError = error.details?.[0];

    // Build localization key from path and error type
    let key: string;
    if (joiError.path?.length > 0) {
      // Replace array indices with 'item'
      const pathSegments = joiError.path.map((segment: any) =>
        typeof segment === 'number' ? 'item' : String(segment)
      );

      // Extract error key from Joi type
      const typeParts = joiError.type.split('.');
      const errorKey =
        joiError.context?.errorKey ||
        (typeParts.length > 2 ? typeParts[typeParts.length - 2] : typeParts[typeParts.length - 1]) ||
        joiError.type;

      key = `${pathSegments.join('.')}.${errorKey}`;
    } else {
      key = joiError.context?.errorKey || joiError.type.split('.').pop() || joiError.type;
    }

    // Handle unknown fields separately
    if (joiError.type === 'object.unknown') {
      const field = joiError.context?.key;
      throw new BadRequestException({
        message: {
          en: `The field ${field} is not allowed.`,
          ar: `الحقل ${field} غير مسموح به.`,
        },
        field,
        location,
      });
    }

    // Throw localized validation error
    throw new BadRequestException({
      message: {
        en: localizeMessage({ key, lang: Lang.EN, context: joiError.context }),
        ar: localizeMessage({ key, lang: Lang.AR, context: joiError.context }),
      },
      field: joiError.context?.label || joiError.context?.key,
      location,
    });
  }
}
