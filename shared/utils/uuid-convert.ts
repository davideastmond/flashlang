import { createTranslator } from "short-uuid";
export const getFullUuid = (shortId: string) => {
  const translator = createTranslator();
  return translator.toUUID(shortId);
};

export const toShortenedUuid = (fullId: string) => {
  const translator = createTranslator();
  return translator.fromUUID(fullId);
};
