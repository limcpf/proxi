import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import type { EchoDetail, ListEchoesResponse } from "@proxi/shared";
import { EchoApplicationService } from "../../application/echo.application.service.js";
import { EchoApplicationError } from "../../domain/echo.errors.js";

@Controller("echoes")
export class EchoController {
  constructor(
    @Inject(EchoApplicationService)
    private readonly echoApplication: EchoApplicationService,
  ) {}

  @Post()
  async createEcho(@Body() body: unknown): Promise<EchoDetail> {
    return this.mapErrors(() => this.echoApplication.createRoot(body));
  }

  @Get()
  async listEchoes(@Query() query: unknown): Promise<ListEchoesResponse> {
    return this.mapErrors(() => this.echoApplication.listRootEchoes(query));
  }

  @Get(":echoId")
  async getEcho(@Param("echoId") echoId: string): Promise<EchoDetail> {
    return this.mapErrors(() => this.echoApplication.getDetail(echoId));
  }

  @Patch(":echoId")
  async updateEcho(
    @Param("echoId") echoId: string,
    @Body() body: unknown,
  ): Promise<EchoDetail> {
    return this.mapErrors(() => this.echoApplication.update(echoId, body));
  }

  @Delete(":echoId")
  @HttpCode(204)
  async archiveEcho(@Param("echoId") echoId: string): Promise<void> {
    return this.mapErrors(() => this.echoApplication.archive(echoId));
  }

  @Post(":echoId/replies")
  async createReply(
    @Param("echoId") echoId: string,
    @Body() body: unknown,
  ): Promise<EchoDetail> {
    return this.mapErrors(() => this.echoApplication.createReply(echoId, body));
  }

  private async mapErrors<TResult>(
    operation: () => Promise<TResult>,
  ): Promise<TResult> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof EchoApplicationError) {
        throw new HttpException(
          {
            code: error.code,
            message: error.message,
          },
          error.httpStatus,
        );
      }

      throw error;
    }
  }
}
