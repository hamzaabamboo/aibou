import { useEffect, useRef } from "react";
import { useDownloadOfflineDictionary } from "./useDownloadOfflineDictionary";

export const useOfflineDictionary = () => {
  const { isDBDownloaded } = useDownloadOfflineDictionary();
  const worker = useRef<Worker>();

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

  const search = async (searchTerm: string) =>
    new Promise((resolve) => {
      if (!worker.current) return;
      console.log("seearch", searchTerm);
      worker.current.postMessage({
        type: "searchWord",
        data: searchTerm,
      });
      worker.current.onmessage = ({ data }) =>
        data.type === "searchWordResult" && resolve(data.data);
    });

  return {
    search,
    isDBDownloaded,
  };
};
