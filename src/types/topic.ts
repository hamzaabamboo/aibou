import { JishoWord } from './jisho';

export type Topic = {
  id?: string;
  name: string;
  description?: string;
  isDeleted?: boolean;
  createdAt: Date;
  lastUpdatedAt: Date;
};

export type TopicItem = {
  id?: string;
  topicId: string;
  word: string;
  notes?: string;
  jishoData?: JishoWord;
  isDeleted?: boolean;
  tags?: string[];
  createdAt?: Date;
  lastUpdatedAt?: Date;
};
