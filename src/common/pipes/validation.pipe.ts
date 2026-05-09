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

    const bodyDto = metatype;
    const location = metadata.type || 'body';

    /**
     * Convert plain object into DTO instance
     * so Joi decorators can be resolved.
     */
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

    /**
     * Build localization key
     *
     * Examples:
     * - phoneNumber.string.pattern.base
     * - email.string.email
     * - media.object.missing
     */
    let key: string;

    if (joiError.path && joiError.path.length > 0) {

      /**
       * Replace array indexes with "item"
       * Example:
       * users.0.email
       * =>
       * users.item.email
       */
      const pathSegments = joiError.path.map((segment: any) =>
        typeof segment === 'number'
          ? 'item'
          : String(segment)
      );

      /**
       * Preserve complete Joi validation type
       *
       * Examples:
       * - string.pattern.base
       * - string.email
       * - object.missing
       * - any.required
       */
      const typeSegments = joiError.type.split('.');

      const errorKey =
        joiError.context?.errorKey ||
        (
          typeSegments.length > 2
            ? typeSegments[typeSegments.length - 2]
            : typeSegments[typeSegments.length - 1]
        ) ||
        joiError.type;

      key = `${pathSegments.join('.')}.${errorKey}`;

    } else {

      key =
        joiError.context?.errorKey ||
        joiError.type.split('.').pop() ||
        joiError.type;
    }

    /**
     * Handle unknown fields
     */
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

    /**
     * Localized Joi validation messages
     */
    throw new BadRequestException({
      message: {
        en: localizeMessage({
          key,
          lang: Lang.EN,
          context: joiError.context,
        }),

        ar: localizeMessage({
          key,
          lang: Lang.AR,
          context: joiError.context,
        }),
      },

      field:
        joiError.context?.label ||
        joiError.context?.key,

      location,
    });
  }
}
