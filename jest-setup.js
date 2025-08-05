import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';

// Mock native modules that have no JS implementation in Jest
jest.mock('react-native-orientation-locker', () => ({
  lockToLandscape: jest.fn(),
  lockToPortrait: jest.fn(),
  unlockAllOrientations: jest.fn(),
  lockToLandscapeLeft: jest.fn(),
}));

jest.mock('react-native-keep-awake', () => ({
  activate: jest.fn(),
  deactivate: jest.fn(),
}));

jest.mock('react-native-device-info', () => ({
    getApiLevel: jest.fn().mockResolvedValue(33),
    getBatteryLevel: jest.fn().mockResolvedValue(0.9),
    isBatteryCharging: jest.fn().mockResolvedValue(false),
    getUsedMemory: jest.fn().mockResolvedValue(1024*1024*500),
    getTotalMemory: jest.fn().mockResolvedValue(1024*1024*1024*4),
    getFreeDiskStorage: jest.fn().mockResolvedValue(1024*1024*1024*10),
    getTotalDiskCapacity: jest.fn().mockResolvedValue(1024*1024*1024*128),
}));

jest.mock('react-native-permissions', () => require('react-native-permissions/mock'));

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(() => Promise.resolve(true)),
    getCurrentUser: jest.fn(() => Promise.resolve(null)),
    signIn: jest.fn(),
    signOut: jest.fn(),
    revokeAccess: jest.fn(),
    getTokens: jest.fn(() => Promise.resolve({ accessToken: 'fake-access-token' })),
  },
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  },
}));

// Mock NodeMediaClient's NodeCameraView as it's a native UI component
jest.mock('react-native-nodemediaclient', () => ({
  NodeCameraView: 'NodeCameraView',
}));
