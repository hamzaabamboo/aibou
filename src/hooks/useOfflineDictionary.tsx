import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { JishoWord } from "../types/jisho";
import { useDownloadOfflineDictionary } from "./useDownloadOfflineDictionary";
import { useKeyValueData } from "./useKeyValueData";

export const useOfflineDictionary = (keyword: string) => {
  const { isDBDownloaded } = useDownloadOfflineDictionary();
  const [
    { data: offlineDictionaryEnabled },
    { mutate: updateDictionaryEnabledStatus },
  ] = useKeyValueData("offlineDictionaryEnabled", true);
  const worker = useRef<Worker>();

  const isAvailable = isDBDownloaded && (offlineDictionaryEnabled ?? false);
  useEffect(() => {
    worker.current = new Worker(
      new URL("../workers/offline-search.worker.ts", import.meta.url)
    );
    worker.current.onmessage = async ({ data }) => {
      switch (data.type) {
        case "searchWordResult":
      }
    };
    return () => {
      worker.current?.terminate();
    };
  }, []);

  const search = async (searchTerm: string): Promise<JishoWord[]> =>
    new Promise((resolve) => {
      if (!worker.current) return;
      worker.current.postMessage({
        type: "searchWord",
        data: searchTerm,
      });
      worker.current.onmessage = ({ data }) =>
        data.type === "searchWordResult" && resolve(data.data);
    });

  return {
    isAvailable,
    data: useQuery(["offlineSearch", keyword], async () => {
      if (!keyword) return [];
      return search(keyword);
    }),
  };
};
