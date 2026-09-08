import { useState, useEffect, useCallback } from 'react';
import {
  scanUserExpiredItems,
  purgeUserExpiredData,
  ExpiredItemsCount
} from '../services/cleanup/userCleanup.service';

export const useExpiredCounter = (uid: string | null) => {
  const [expiredData, setExpiredData] = useState<ExpiredItemsCount>({
    total: 0,
    messagePaths: [],
    requestPaths: [],
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const checkExpiredCount = useCallback(async () => {
    if (!uid) return;
    const scan = await scanUserExpiredItems(uid);
    setExpiredData(scan);
  }, [uid]);

  useEffect(() => {
    checkExpiredCount();
    const interval = setInterval(checkExpiredCount, 20000);
    return () => clearInterval(interval);
  }, [checkExpiredCount]);

  const executeSweep = async () => {
    if (!uid || expiredData.total === 0) return;
    setIsDeleting(true);
    const success = await purgeUserExpiredData(uid, expiredData);
    if (success) {
      await checkExpiredCount();
    }
    setIsDeleting(false);
  };

  return {
    count: expiredData.total,
    executeSweep,
    isDeleting,
  };
};
