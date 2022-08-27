import { JishoWord } from "./jisho";

export type Topic = {
  id?: number;
  name: string;
  description?: string;
  createdAt: Date;
};

export type TopicItem = {
  id?: number;
  topicId: number;
  word: string;
  notes?: string;
  jishoData?: JishoWord;
  tags: string[];
  createdAt: Date;
};
