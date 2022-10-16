import { JishoWord } from "./jisho";

export type Topic = {
  id?: string;
  name: string;
  description?: string;
  createdAt: Date;
  lastUpdatedAt: Date;
};

export type TopicItem = {
  id?: string;
  topicId: string;
  word: string;
  notes?: string;
  jishoData?: JishoWord;
  tags: string[];
  createdAt: Date;
  lastUpdatedAt: Date;
};
