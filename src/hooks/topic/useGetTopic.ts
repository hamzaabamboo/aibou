import { useQuery } from '@tanstack/react-query';
import { Topic } from '../../types/topic';
import { db } from '../../utils/db/db';

export const useGetTopic = (topicId: string) => useQuery(
  ['fetchTopic', topicId],
  async (): Promise<Topic | undefined> => {
    const idNumber = Number(topicId);
    try {
      const data = (await db?.topics.get(topicId))
          || (!isNaN(idNumber) && (await db?.topics.get(idNumber)))
          || undefined;
      return data;
    } catch (error) {
      return undefined;
    }
  },
  { enabled: !!topicId}
);
