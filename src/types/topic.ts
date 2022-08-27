import { JishoWord } from "./jisho";

export type Topic = {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
};

export type TopicItem = {
  id: string;
  word: JishoWord;
  notes: string;
  createdAt: Date;
};
