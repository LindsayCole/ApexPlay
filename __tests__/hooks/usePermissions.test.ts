import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { renderHook, act } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { usePermissions } from '../../hooks/usePermissions';
import * as RNPermissions from 'react-native-permissions';
import DeviceInfo from 'react-native-device-info';

// Mock the modules
jest.mock('react-native-permissions', () => {
    const original = jest.requireActual('react-native-permissions');
    return {
        PERMISSIONS: original.PERMISSIONS,
        RESULTS: original.RESULTS,
        checkMultiple: jest.fn(),
        requestMultiple: jest.fn(),
    };
});

jest.mock('react-native-device-info', () => ({
    getApiLevel: jest.fn(),
}));

// Typecast the mocked functions to make TypeScript happy
const mockedCheckMultiple = RNPermissions.checkMultiple as jest.Mock;
const mockedRequestMultiple = RNPermissions.requestMultiple as jest.Mock;
const mockedGetApiLevel = DeviceInfo.getApiLevel as jest.Mock;

describe('hooks/usePermissions', () => {
    
    beforeEach(() => {
        // Reset mocks before each test
        mockedCheckMultiple.mockClear();
        mockedRequestMultiple.mockClear();
        mockedGetApiLevel.mockClear();
        // Mock AppState and its event listener
        jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove: jest.fn() } as any);
    });

    it('should check for modern storage permission on Android 13+ (API 33)', async () => {
        mockedGetApiLevel.mockResolvedValue(33);
        mockedCheckMultiple.mockResolvedValue({});

        const { result } = renderHook(() => usePermissions());
        
        await act(async () => {
            await result.current.checkPermissions();
        });

        expect(mockedCheckMultiple).toHaveBeenCalledWith([
            RNPermissions.PERMISSIONS.ANDROID.CAMERA,
            RNPermissions.PERMISSIONS.ANDROID.RECORD_AUDIO,
            RNPermissions.PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
        ]);
    });

    it('should check for legacy storage permission on Android <13', async () => {
        mockedGetApiLevel.mockResolvedValue(31);
        mockedCheckMultiple.mockResolvedValue({});

        const { result } = renderHook(() => usePermissions());
        
        await act(async () => {
            await result.current.checkPermissions();
        });

        expect(mockedCheckMultiple).toHaveBeenCalledWith([
            RNPermissions.PERMISSIONS.ANDROID.CAMERA,
            RNPermissions.PERMISSIONS.ANDROID.RECORD_AUDIO,
            RNPermissions.PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
        ]);
    });

    it('should correctly map permission statuses', async () => {
        mockedGetApiLevel.mockResolvedValue(33);
        mockedCheckMultiple.mockResolvedValue({
            [RNPermissions.PERMISSIONS.ANDROID.CAMERA]: 'granted',
            [RNPermissions.PERMISSIONS.ANDROID.RECORD_AUDIO]: 'denied',
            [RNPermissions.PERMISSIONS.ANDROID.READ_MEDIA_IMAGES]: 'blocked',
        });

        const { result } = renderHook(() => usePermissions());
        
        let statuses;
        await act(async () => {
           statuses = await result.current.checkPermissions();
        });
        
        expect(result.current.permissions).toEqual({
            camera: 'granted',
            microphone: 'denied',
            storage: 'blocked',
        });
        expect(statuses).toEqual({
            camera: 'granted',
            microphone: 'denied',
            storage: 'blocked',
        });
    });

    it('should request permissions and update state', async () => {
        mockedGetApiLevel.mockResolvedValue(33);
        mockedRequestMultiple.mockResolvedValue({
            [RNPermissions.PERMISSIONS.ANDROID.CAMERA]: 'granted',
            [RNPermissions.PERMISSIONS.ANDROID.RECORD_AUDIO]: 'granted',
            [RNPermissions.PERMISSIONS.ANDROID.READ_MEDIA_IMAGES]: 'denied',
        });

        const { result } = renderHook(() => usePermissions());
        
        await act(async () => {
           await result.current.requestPermissions();
        });

        expect(mockedRequestMultiple).toHaveBeenCalled();
        expect(result.current.permissions).toEqual({
            camera: 'granted',
            microphone: 'granted',
            storage: 'denied',
        });
    });
});