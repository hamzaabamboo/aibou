export type Topic = {
  id?: string;
  name: string;
  description?: string;
  createdAt: Date;
};

export type TopicItem = {
  id?: string;
  topicId: string;
  word: string;
  notes?: string;
  tags: string[];
  createdAt: Date;
};
