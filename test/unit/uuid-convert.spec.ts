import { describe, it, expect } from "vitest";
import shortUuid from "short-uuid";

describe("UUID Conversion", () => {
  it("should convert a full UUID to a shortened UUID and back", () => {
    const sampleUuid = "123e4567-e89b-12d3-a456-426614174000";
    const translator = shortUuid.createTranslator();

    const shortened = translator.fromUUID(sampleUuid);

    const convertedBack = translator.toUUID(shortened);
    expect(convertedBack).toBe(sampleUuid);
  });
});
