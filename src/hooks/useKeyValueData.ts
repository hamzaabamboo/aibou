import { UseQueryResult } from "@tanstack/react-query";
import { UseMutationResult } from "@tanstack/react-query";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { db } from "../utils/db";

export const useKeyValueData = <T extends object | string | number>(
  key: string,
  defaultValue: T
) => {
  const queryClient = useQueryClient();
  const data = useQuery(["fetchKeyData", key], async () => {
    try {
      const data = await db?.keyValues.get(key);
      if (!data) {
        await db?.keyValues.add({ key, value: defaultValue });
        return (await db?.keyValues.get(key))?.value;
      }
      return data?.value;
    } catch (error) {
      await db?.keyValues.add({ key, value: defaultValue });
      return (await db?.keyValues.get(key))?.value;
    }
  });

  const setData = useMutation(
    async (data: T) => {
      await db?.keyValues.update(key, { key, value: data });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["fetchKeyData", key]);
      },
    }
  );

  return [data ?? {}, setData ?? {}] as [UseQueryResult<T>, UseMutationResult];
};
