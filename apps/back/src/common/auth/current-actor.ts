import { createParamDecorator } from "@nestjs/common";
import {
  type ActorId,
  actorIdSchema,
  type EchoAuthorType,
} from "@proxi/shared";

export interface RequestActor {
  id: ActorId;
  type: EchoAuthorType;
  displayName: string;
}

export const ownerActor: RequestActor = {
  id: actorIdSchema.parse("actor_owner"),
  type: "owner",
  displayName: "Owner",
};

// 첫 버전은 로그인 없는 단일 owner 제품이다. 인증 계층이 생기면 이 resolver 만 교체한다.
export const CurrentActor = createParamDecorator(
  (): RequestActor => ownerActor,
);
