import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../utils/db';
import { Topic } from '../types/topic';

export const useUpdateTopic = (topicId: string) => {
  const queryClient = useQueryClient();
  return useMutation(
    async (data: Partial<Topic>) => {
      const idNumber = Number(topicId);
      await db?.topics.update(isNaN(idNumber) ? topicId : idNumber, {
        ...data,
        lastUpdatedAt: new Date(),
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['fetchTopic', topicId]);
      },
    },
  );
};
