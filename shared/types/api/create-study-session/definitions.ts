export type CreateStudySessionAPIRequest = {
  studySetId: string;
  startTime: string;
  endTime: string;
  results: Array<{
    cardId: string;
    userAnswer: string;
    isCorrect: boolean;
    answeredAt: string;
  }>;
  score: {
    correctCount: number;
    totalCount: number;
    percentage: number;
  };
};
