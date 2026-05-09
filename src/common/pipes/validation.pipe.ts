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

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;
    const bodyDto = metatype; // DTO class used for request validation
    const location = metadata.type || 'body';

    // Convert plain JSON request body into a typed DTO instance so Joi can read the schema metadata.
    // Without transformation, class-based decorators are not available on plain objects.
    const dtoObject = plainToInstance(bodyDto, value);
    const schema = getClassSchema(bodyDto);

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

    // Construct localization key from Joi error path for nested validations
    let key: string;
    if (joiError.path && joiError.path.length > 0) {
      // For array items, replace numeric indices with 'item'
      const pathSegments = joiError.path.map((segment: any) =>
        typeof segment === 'number' ? 'item' : String(segment)
      );
      // Extract the error key from joiError.type (e.g., "any.required" -> "required")
      const errorKey = joiError.context?.errorKey || joiError.type.split('.').pop() || joiError.type;
      key = pathSegments.join('.') + '.' + errorKey;
    } else {
      key = joiError.context?.errorKey || joiError.type.split('.').pop() || joiError.message;
    }

    /** Unknown field */
    if (joiError.type === "object.unknown") {
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
    /**
     * localizeMessage validation messages for both supported languages.
     * The localizeMessage helper resolves the translation key and injects context values,
     * such as `{#limit}` or `{#value}`, into the final string.
     */
    throw new BadRequestException({
      message: {
        en: localizeMessage({ key, lang: Lang.EN, context: joiError.context }),
        ar: localizeMessage({ key, lang: Lang.AR, context: joiError.context }),
      },
      field: joiError.context?.label || joiError.context?.key,
      location: 'body',
    });
  }
}
