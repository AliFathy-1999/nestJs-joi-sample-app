import { HttpStatus } from '@nestjs/common';
import {
  AppResponseEntry,
  AppResponseMessagesInterface,
} from '../../interfaces/response-message.interface';

export const AppResponseMessages: AppResponseMessagesInterface = {
  ERROR: {
    UNKNOWN_ERROR: {
      message: {
        en: 'Internal server error',
        ar: 'حدث خطأ ما',
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    },
  },
  SUCCESS: {
    SERVICE_IS_RUNNING: {
      message: {
        en: 'Server is up and running smoothly.',
        ar: 'الخادم يعمل بشكل سلس.',
      },
      status: HttpStatus.OK,
    },
  },
};
