// Using OpenAI, we can implement a simple answer judging mechanism.
export default defineEventHandler(async (event) => {
  const body = await readBody<{
    question: String;
    userAnswer: string;
    correctAnswer: string;
  }>(event);
  const prompt = `You are an answer judge. 
    Determine if the user's answer is correct compared to the correct answer. 
    Be generous, and consider minor spelling mistakes or synonyms as correct. Case insensitive.
    Be flexible with numbers.
    Question: "${body.question}"
    User's answer: "${body.userAnswer}"
    Correct answer: "${body.correctAnswer}"
    Respond with a JSON object with two keys: one that shows whether the user's answer is correct and the other, a short reasoning.
    an example response: { isCorrect: true, reasoning: "The user's answer is a synonym of the correct answer." };
    an example response: { isCorrect: false, reasoning: "The user's answer has significant spelling mistakes and does not match the meaning of the correct answer." }
    Do not respond with anything other than the JSON object. Ensure your response can be parsed with JSON.parse().
  `;

  const response = await generateOpenAIResponse(prompt);
  return {
    success: true,
    data: response,
  };
});
