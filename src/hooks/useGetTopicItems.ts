import { useQuery } from '@tanstack/react-query';
import { db } from '../utils/db/db';

export const useGetTopicItems = (topicId: string) => useQuery(['fetchTopicItems', topicId], async () => {
  const idNumber = parseInt(topicId);
  let q = await db?.topicEntries.where('topicId').equals(topicId);
  if (!isNaN(idNumber)) {
    q = q?.or('topicId').equals(idNumber);
  }
  return ((await q?.reverse().sortBy('createdAt')) ?? []).filter(
    (f) => !f.isDeleted,
  );
});
