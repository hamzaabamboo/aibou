import { useEffect, useRef, useState } from 'react';

export const useDownloadOfflineDictionary = () => {
  const [error, setError] = useState();
  const [isProcessing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const worker = useRef<Worker>();

  useEffect(() => {
    worker.current = new Worker(
      new URL('../workers/downloadDictionary.ts', import.meta.url),
    );
    worker.current.onmessage = async ({ data }) => {
      const { default: untar } = await import('js-untar');
      switch (data.type) {
        case 'error':
          break;
        case 'downloadProgress':
          setProgressText('downloading');
          setProgress(data.value);
          break;
        case 'downloadCompleted':{
          setProgressText('downloading');
          worker.current?.postMessage({
            type: 'extract',
            data: (await untar(data.value as Uint8Array))[0].buffer,
          });
          break;
        }
        case 'extractComplete':
          setProgressText('Download Completed');
          break;
        case 'completed':
          setProgressText('Import data Completed');
          break;
      }
    };
    return () => {
      worker.current?.terminate();
    };
  }, []);

  const download = () => {
    if (isProcessing) return;
    worker.current?.postMessage({
      type: 'download',
    });
  };
  return {
    download, error, progress, progressText,
  };
};
