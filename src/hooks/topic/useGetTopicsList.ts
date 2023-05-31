import { useQuery } from '@tanstack/react-query';
import { db } from '../../utils/db/db';

export const useGetTopicsList = () => useQuery(['fetchTopicsList'], async () => {
  const data = await db?.topics.orderBy("lastUpdatedAt").reverse().toArray();
  return (data ?? []).filter((f) => !f.isDeleted);
});
