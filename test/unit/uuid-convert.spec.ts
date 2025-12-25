import { describe, it, expect } from "vitest";
import { getFullUuid, toShortenedUuid } from "./shared/utils/uuid-convert";
import shortUuid from "short-uuid";

describe("UUID Convert tests", () => {
  it("should convert a full UUID to a shortened UUID", () => {
    const fullUuid = "123e4567-e89b-12d3-a456-426614174000";

    const shortened = toShortenedUuid(fullUuid);

    const convertedBack = getFullUuid(shortened);
    expect(convertedBack).toBe(fullUuid);
  });
});
