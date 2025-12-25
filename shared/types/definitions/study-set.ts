export type StudySet = {
  id: string;
  title: string;
  description: string | null;
  cardCount?: number;
  createdAt: Date;
  updatedAt: Date;
};
