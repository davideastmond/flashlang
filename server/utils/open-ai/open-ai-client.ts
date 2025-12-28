import OpenAIApi from "openai";
export const generateOpenAIResponse = async (prompt: string) => {
  const openAiClient = new OpenAIApi();

  const response = await openAiClient.responses.create({
    model: "gpt-5-nano",
    input: prompt,
  });
  return response.output_text;
};
