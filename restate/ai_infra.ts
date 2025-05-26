import * as restate from "@restatedev/restate-sdk";
import { LanguageModelV1, LanguageModelV1CallOptions, LanguageModelV1Middleware, wrapLanguageModel } from "ai";
import superjson from 'superjson';

export type DoGenerateResponseType = Awaited<ReturnType<LanguageModelV1["doGenerate"]>>;

class SuperJsonSerde implements restate.Serde<DoGenerateResponseType> {
  contentType = "application/json";

  serialize(value: DoGenerateResponseType): Uint8Array {
    const js = superjson.stringify(value);
    return new TextEncoder().encode(js);
  }

  deserialize(data: Uint8Array): DoGenerateResponseType {
    const js = new TextDecoder().decode(data);
    return superjson.parse(js) as DoGenerateResponseType;
  }
}

export const middleware = (
  ctx: restate.Context,
  opts?: restate.RunOptions<DoGenerateResponseType>
): LanguageModelV1Middleware => {
  const runOpts = { serde: new SuperJsonSerde(), ...opts };

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

