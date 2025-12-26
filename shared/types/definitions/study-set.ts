export type StudySet = {
  id: string;
  title: string;
  description: string | null;
  cardCount?: number;
  language: string;
  createdAt: Date;
  updatedAt: Date;
};
