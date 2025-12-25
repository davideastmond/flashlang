export type CreateStudySetPostRequestBody = {
  title: string;
  description?: string;
  flashCards: Array<{
    question: string;
    answer: string;
  }>;
};
