import { useQuery } from '@tanstack/react-query';
import { Topic } from '../types/topic';
import { db } from '../utils/db/db';

export const useLastUpdatedTopics = () => useQuery(['fetchLastUpdatedTopics'], async () => {
  const data = await (
    await db?.topics.orderBy("lastUpdatedAt").reverse().limit(3).toArray()
  )?.values();
  return Array.from(data ?? []).filter(d => !d.isDeleted) as Topic[];
});
