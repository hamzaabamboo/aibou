import { useEffect, useRef, useState } from 'react'

export const useDownloadOfflineDictionary = () => {
  const [error, setError] = useState()
  const [isProcessing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isDBDownloaded, setIsDBDownloaded] = useState(false)
  const [progressText, setProgressText] = useState('')
  const worker = useRef<Worker>()

  useEffect(() => {
    worker.current = new Worker(new URL('../../workers/initdb-worker.ts', import.meta.url))
    worker.current.onmessage = async ({ data }) => {
      switch (data.type) {
        case 'error':
          break
        case 'message':
          setProgressText(data.value)
          break
        case 'downloadProgress':
          setProgressText('Downloading...')
          setProgress(data.value)
          break
        case 'checkResult':
          setProcessing(false)
          setProgressText('')
          setIsDBDownloaded(data.value)
          break
        default:
          console.log(data)
          break
      }
    }
    setProcessing(true)
    worker.current.postMessage({
      type: 'check'
    })
    worker.current.onerror = function(error) { console.log(error,error.message)}
    return () => {
      worker.current?.terminate()
    }
  }, [])

  const download = () => {
    console.log('Download!')
    if (isProcessing) return
    setProcessing(true)
    worker.current?.postMessage({
      type: 'download'
    })
  }

  const deleteDictionary = () => {
    if (isProcessing) return
    worker.current?.postMessage({
      type: 'delete'
    })
  }
  return {
    download, error, progress, progressText, isProcessing, isDBDownloaded, deleteDictionary
  }
}
