import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module.js";
import { ApiExceptionFilter } from "./common/http/api-exception.filter.js";
import { parseCorsOrigins } from "./common/http/cors.js";

const jsonBodyLimit = "15mb";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
    logger: ["error", "warn", "log"],
  });
  const port = Number(process.env.PORT ?? 3000);

  app.useBodyParser("json", { limit: jsonBodyLimit });
  app.useBodyParser("urlencoded", { extended: true, limit: jsonBodyLimit });
  app.enableCors({
    origin: parseCorsOrigins(),
  });
  app.useGlobalFilters(new ApiExceptionFilter());

  await app.listen(port);
}

void bootstrap();
