import { describe, expect, it } from "vitest";
import { removeDiacritics } from "../../shared/utils/remove-diacritics";

describe("removeDiacritics tests", () => {
  it("should remove accents from French characters", () => {
    expect(removeDiacritics("café")).toBe("cafe");
    expect(removeDiacritics("crème brûlée")).toBe("creme brulee");
    expect(removeDiacritics("résumé")).toBe("resume");
  });

  it("should remove diacritics from Spanish characters", () => {
    expect(removeDiacritics("niño")).toBe("nino");
    expect(removeDiacritics("mañana")).toBe("manana");
    expect(removeDiacritics("José")).toBe("Jose");
  });

  it("should remove diacritics from Portuguese characters", () => {
    expect(removeDiacritics("São Paulo")).toBe("Sao Paulo");
    expect(removeDiacritics("João")).toBe("Joao");
    expect(removeDiacritics("açúcar")).toBe("acucar");
  });

  it("should remove diacritics from German characters", () => {
    expect(removeDiacritics("schön")).toBe("schon");
    expect(removeDiacritics("Müller")).toBe("Muller");
    expect(removeDiacritics("Zürich")).toBe("Zurich");
  });

  it("should remove diacritics from mixed character sets", () => {
    expect(removeDiacritics("naïve")).toBe("naive");
    expect(removeDiacritics("Beyoncé")).toBe("Beyonce");
    expect(removeDiacritics("piñata")).toBe("pinata");
  });

  it("should handle strings without diacritics", () => {
    expect(removeDiacritics("hello world")).toBe("hello world");
    expect(removeDiacritics("test123")).toBe("test123");
    expect(removeDiacritics("")).toBe("");
  });

  it("should preserve spaces and punctuation", () => {
    expect(removeDiacritics("Hôtel, café & résumé!")).toBe(
      "Hotel, cafe & resume!"
    );
    expect(removeDiacritics("¿Cómo estás?")).toBe("¿Como estas?");
  });

  it("should handle uppercase characters", () => {
    expect(removeDiacritics("CAFÉ")).toBe("CAFE");
    expect(removeDiacritics("MÜNCHEN")).toBe("MUNCHEN");
    expect(removeDiacritics("FRANÇOIS")).toBe("FRANCOIS");
  });

  it("should handle long strings", () => {
    const input =
      "La liberté consiste à pouvoir faire tout ce qui ne nuit pas à autrui";
    const expected =
      "La liberte consiste a pouvoir faire tout ce qui ne nuit pas a autrui";
    expect(removeDiacritics(input)).toBe(expected);
  });
});
