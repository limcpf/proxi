import { Injectable } from "@nestjs/common";
import { sharedContractVersion, toApiSuccess } from "@proxi/shared";

export interface HealthResponse {
  service: "proxi-back";
  status: "ok";
}

export interface SharedContractPayload {
  service: "proxi-back";
  sharedContractVersion: typeof sharedContractVersion;
}

@Injectable()
export class AppService {
  getHealth(): HealthResponse {
    return {
      service: "proxi-back",
      status: "ok",
    };
  }

  getSharedContract() {
    return toApiSuccess<SharedContractPayload>({
      service: "proxi-back",
      sharedContractVersion,
    });
  }
}
