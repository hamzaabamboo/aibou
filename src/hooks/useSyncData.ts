import { useToast } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { Topic, TopicItem } from '../types/topic';
import { getNewData, importData } from '../utils/exportData';
import { useKeyValueData } from './useKeyValueData';

export const useSyncData = () => {
  const [isSyncing, setSyncing] = useState(false);
  const [{ data: syncUrl, isLoading }] = useKeyValueData('syncUrl', '');
  const [{ data: syncSecret }] = useKeyValueData('syncSecret', '');
  const [{ data: lastSyncedTime }, { mutate: updateLastUpdatedTime }] = useKeyValueData('lastSyncedTime', '');
  const toast = useToast();
  const queryClient = useQueryClient();

  const syncEnabled = syncUrl && syncSecret;

  return {
    syncEnabled,
    lastSyncedTime: lastSyncedTime ?? 0,
    sync: async (lastUpdated: Date = new Date(lastSyncedTime ?? 0)) => {
      if (!syncUrl || !syncSecret || isSyncing) return;
      setSyncing(true);
      const newData = await getNewData(lastUpdated);
      try {
        const { data } = await axios.post<{
          topics: Topic[];
          topicItem: TopicItem[];
          timestamp: number;
        }>(
          syncUrl,
          { newData, lastUpdated: lastUpdated.valueOf() },
          {
            headers: {
              'x-aibou-secret': syncSecret,
            },
          },
        );
        await importData(data);
        const clientUpdated = (newData.topicItem && newData.topicItem.length > 0)
          || (newData.topics && newData.topics.length > 0);
        const serverUpdated = data.topicItem.length > 0 || data.topics.length > 0;
        if (serverUpdated) {
          queryClient.invalidateQueries(['fetchTopicsList']);
          queryClient.invalidateQueries({
            predicate: (query) => query.queryKey[0] === 'fetchTopicItems',
          });
        }
        if (clientUpdated || serverUpdated) {
          await updateLastUpdatedTime(new Date().valueOf());
          toast({
            title: 'Update Succesfully',
            status: 'success',
            description: 'Data has been updated',
          });
        }
      } catch (error) {
        toast({
          title: 'Sync Failed',
          status: 'error',
          description: `Something went wrong ${(error as any).message}`,
        });
      }
      setSyncing(false);
    },
  };
};
