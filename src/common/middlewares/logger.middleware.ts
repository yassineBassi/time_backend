import { Injectable, NestMiddleware } from '@nestjs/common';
import { logger } from '../winston-logger';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: any, res: any, next: (error?: Error | any) => void) {
    const { method, originalUrl, body, headers } = req;

    if (originalUrl.split('/')[1] == 'images') return next();


    logger.info('--------------------------------------------');
    logger.info('request : ' + method + ' ' + originalUrl);
    logger.info('headers: ' + JSON.stringify(headers));
    logger.info('body: ' + JSON.stringify(body));
    logger.info('--------------------------------------------');

    const startTime = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      logger.info(
        'response : ' +
          method +
          ' ' +
          originalUrl +
          ' completed in' +
          duration +
          'ms with status: ' +
          res.statusCode,
      );
    });

    next();
  }
}
