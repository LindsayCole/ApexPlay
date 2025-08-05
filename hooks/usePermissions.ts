
import { useState, useEffect, useCallback } from 'react';
import { AppState, Platform } from 'react-native';
import {
  checkMultiple,
  requestMultiple,
  PERMISSIONS,
  PermissionStatus,
  Permission,
} from 'react-native-permissions';
import DeviceInfo from 'react-native-device-info';
import { logger } from '../services/loggingService';

type PermissionDict = {
  [key: string]: PermissionStatus;
};

const getAndroidPermissions = async (): Promise<Permission[]> => {
    const apiLevel = await DeviceInfo.getApiLevel();
    const list: Permission[] = [
        PERMISSIONS.ANDROID.CAMERA,
        PERMISSIONS.ANDROID.RECORD_AUDIO,
    ];
    if (apiLevel >= 33) {
        list.push(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
        logger.info('Requesting READ_MEDIA_IMAGES for Android 13+');
    } else {
        list.push(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
        logger.info('Requesting READ_EXTERNAL_STORAGE for Android <13');
    }
    return list;
}

const getPermissionMapping = (statuses: Partial<Record<Permission, PermissionStatus>>) => {
    const normalized: PermissionDict = {};
    if (statuses[PERMISSIONS.ANDROID.CAMERA]) normalized.camera = statuses[PERMISSIONS.ANDROID.CAMERA];
    if (statuses[PERMISSIONS.ANDROID.RECORD_AUDIO]) normalized.microphone = statuses[PERMISSIONS.ANDROID.RECORD_AUDIO];
    
    const storageStatus = statuses[PERMISSIONS.ANDROID.READ_MEDIA_IMAGES] ?? statuses[PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE];
    if (storageStatus) normalized.storage = storageStatus;
    
    return normalized;
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<PermissionDict>({});

  const checkPermissions = useCallback(async (): Promise<PermissionDict> => {
    if (Platform.OS !== 'android') return {};
    const permissionList = await getAndroidPermissions();
    const statuses = await checkMultiple(permissionList);
    const mapped = getPermissionMapping(statuses);
    setPermissions(mapped);
    logger.info('Checked permissions', mapped);
    return mapped;
  }, []);

  useEffect(() => {
    checkPermissions();
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        logger.info('App became active, re-checking permissions.');
        checkPermissions();
      }
    });
    return () => {
      subscription.remove();
    };
  }, [checkPermissions]);

  const requestPermissions = useCallback(async (): Promise<PermissionDict> => {
    if (Platform.OS !== 'android') return {};
    const permissionList = await getAndroidPermissions();
    const statuses = await requestMultiple(permissionList);
    const mapped = getPermissionMapping(statuses);
    setPermissions(mapped);
    logger.info('Requested permissions', mapped);
    return mapped;
  }, []);

  return { permissions, requestPermissions, checkPermissions };
};