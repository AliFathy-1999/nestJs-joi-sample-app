import { HttpStatus } from '@nestjs/common';

export const CommonResponseMessages = {
  ERROR: {
    UNKNOWN_ERROR: {
      message: {
        en: 'Internal server error',
        ar: 'حدث خطأ ما',
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR
    },
  },
  SUCCESS: {
    SERVICE_IS_RUNNING: {
      message: {
        en: 'Server is up and running smoothly.',
        ar: 'الخادم يعمل بشكل سلس.',
      },
    }
  },
};
