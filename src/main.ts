import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Logger } from '@nestjs/common';

const time = () => Number(process.hrtime.bigint() / 1_000_000n);

const timeDiff = (s: number) => Number(time() - s);

(async () => {
  const startUp = time();
  const logger = new Logger('Main', { timestamp: true });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const fastifyInstance = app.getHttpAdapter().getInstance();

  const fastifyLogger = new Logger('Fastify', { timestamp: true });
  fastifyInstance.addHook('onSend', async (req, reply) => {
    const { method, url, ip } = req;
    const userAgent = req.headers['user-agent'] || '';

    const statusCode = reply.statusCode;
    const contentLength = reply.getHeader('content-length') as string;

    fastifyLogger.debug(
      `${method} ${url} ${statusCode} ${contentLength || '-'} - ${userAgent} ${ip}`,
    );
  });

  await app
    .listen(process.env.PORT ?? 3000, '0.0.0.0')
    .then(() => logger.log(`Started in ${timeDiff(startUp)}ms`));
})().catch((err: Error) => console.log(err.message));
