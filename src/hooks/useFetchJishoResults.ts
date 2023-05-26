import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { orderBy } from 'lodash';
import { SearchAPIResults } from '../types/api';
import { TopicItem } from '../types/topic';
import { db } from '../utils/db';
import { similarity } from '../utils/stringSimilarity';

export const useFetchJishoResults = (topicId: string) => {
  const queryClient = useQueryClient();
  return useMutation(
    ['updateJishoResults'],
    async (words?: TopicItem[]) => {
      if (!words) return;
      for (const word of words) {
        if (!word.id) return;
        const { data } = await axios.get<SearchAPIResults>(
          `/api/search?keyword=${encodeURIComponent(word.word)}`,
        );
        const jishoData = data.results.find((m) => m.japanese.some(
          (w) => w.word === word.word || w.reading === word.word,
        ));

        const sortedReadings = word
          ? orderBy(
            jishoData?.japanese,
            (w) => Math.max(
              w.word ? similarity(w.word, word.word) : -Infinity,
              w.reading ? similarity(w.reading, word.word) : -Infinity,
            ),
            'desc',
          )
          : jishoData?.japanese;

        if (jishoData) {
          await db?.topicEntries.put({
            ...word,
            jishoData: { ...jishoData, japanese: sortedReadings ?? [] },
          });
        }
      }
    },
    {
      onSuccess: () => queryClient.invalidateQueries(['fetchTopicItems', topicId]),
    },
  );
};
