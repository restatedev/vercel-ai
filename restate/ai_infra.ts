import * as restate from "@restatedev/restate-sdk";
import { LanguageModelV1, LanguageModelV1Middleware } from "ai";
import superjson from 'superjson';

export type DoGenerateResponseType = Awaited<ReturnType<LanguageModelV1["doGenerate"]>>;

class SuperJsonSerde<T> implements restate.Serde<T> {
  contentType = "application/json";

  serialize(value: T): Uint8Array {
    const js = superjson.stringify(value);
    return new TextEncoder().encode(js);
  }

  deserialize(data: Uint8Array): T {
    const js = new TextDecoder().decode(data);
    return superjson.parse(js) as T;
  }
}

export const superJson = new SuperJsonSerde<any>();

export const middleware = (
  ctx: restate.Context,
  opts?: restate.RunOptions<DoGenerateResponseType>
): LanguageModelV1Middleware => {
  const runOpts = { serde: new SuperJsonSerde<DoGenerateResponseType>(), ...opts };

  return {
    wrapGenerate({ model, doGenerate }) {
      return ctx.run(
        `calling ${model.provider}`,
        async () => doGenerate(),
        runOpts
      );
    },
  };
};

