export type CreateStudySetPostRequestBody = {
  title: string;
  description?: string;
  language?: string;
  flashCards: Array<{
    question: string;
    answer: string;
  }>;
};
