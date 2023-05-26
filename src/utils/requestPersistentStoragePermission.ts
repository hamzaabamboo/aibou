export const requestPersistentStoragePermission = async () => {
  if (navigator.storage && navigator.storage.persist) {
    try {
      await navigator.storage.persist();
      console.log('Storage is persisted');
      return true;
    } catch (error) {
      console.info('Storage may be cleared by the UA under storage pressure.');
      return false;
    }
  } else {
    console.info('Persistent storage is not supported');
  }
};
