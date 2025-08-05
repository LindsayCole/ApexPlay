/**
 * @file youtubeService.ts
 * @version 2.0.1
 * @author WeirdGoalieDad / Lindsay Cole
 * @description Service for handling YouTube API integration using native Google Sign-In.
 */
import { GoogleSignin, statusCodes, User } from '@react-native-google-signin/google-signin';
import { YOUTUBE_CLIENT_ID } from '../config';
import { logger } from './loggingService';

export interface UserInfo {
    id: string;
    name: string | null;
    email: string;
    photo: string | null;
}

// --- YouTube API Types ---
export interface LiveBroadcastSnippet {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    scheduledStartTime: string;
    thumbnails: {
        [key: string]: { url: string; width: number; height: number; }
    };
}

export interface LiveBroadcastContentDetails {
    boundStreamId: string;
    enableAutoStart: boolean;
    enableAutoStop: boolean;
    enableDvr: boolean;
    recordFromStart: boolean;
    ingestionInfo?: {
        streamName: string;
    };
}

export interface LiveBroadcastStatus {
    lifeCycleStatus: 'created' | 'ready' | 'testing' | 'live' | 'complete' | 'revoked';
    privacyStatus: 'public' | 'private' | 'unlisted';
    recordingStatus: string;
}

export interface LiveBroadcast {
    kind: 'youtube#liveBroadcast';
    etag: string;
    id: string;
    snippet: LiveBroadcastSnippet;
    contentDetails: LiveBroadcastContentDetails;
    status: LiveBroadcastStatus;
}

export interface LiveBroadcastListResponse {
    kind: 'youtube#liveBroadcastListResponse';
    etag: string;
    nextPageToken?: string;
    prevPageToken?: string;
    pageInfo: {
        totalResults: number;
        resultsPerPage: number;
    };
    items: LiveBroadcast[];
}

/**
 * Defines the structure for the request body when scheduling a new broadcast.
 */
interface ScheduleBroadcastRequest {
    snippet: {
        title: string;
        description: string;
        scheduledStartTime: string;
    };
    contentDetails: {
        enableAutoStart: boolean;
        enableAutoStop: boolean;
        enableDvr: boolean;
        recordFromStart: boolean;
    };
    status: {
        privacyStatus: 'public' | 'private' | 'unlisted';
        selfDeclaredMadeForKids: boolean;
    };
}

export const configure = async () => {
    try {
        GoogleSignin.configure({
            webClientId: YOUTUBE_CLIENT_ID,
            scopes: [
                'https://www.googleapis.com/auth/youtube.force-ssl',
                'https://www.googleapis.com/auth/youtube',
            ],
            offlineAccess: true,
        });
        logger.info('Google Sign-In configured successfully.');
    } catch (error) {
        logger.error('Error configuring Google Sign-In.', error);
    }
};

export const getSignedInUser = async (): Promise<UserInfo | null> => {
    try {
        const userInfoResponse = await GoogleSignin.getCurrentUser();
        if (userInfoResponse) {
            return userInfoResponse.user;
        }
        return null;
    } catch (error) {
        logger.error('Error checking signed in user.', error);
        return null;
    }
};

export const signIn = async (): Promise<UserInfo> => {
    try {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const signInResponse = await GoogleSignin.signIn();
        logger.info('Google Sign-In successful.');
        return signInResponse.user;
    } catch (error: any) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) logger.warn('User cancelled the login flow.');
        else if (error.code === statusCodes.IN_PROGRESS) logger.warn('Sign in is in progress already.');
        else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) logger.error('Play services not available or outdated.');
        else logger.error('An unknown error occurred during sign-in.', error);
        throw error;
    }
};

export const signOut = async (): Promise<void> => {
    try {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
        logger.info('User signed out and access revoked.');
    } catch (error) {
        logger.error('Error signing out.', error);
    }
};

const authorizedFetch = async (url: string, options: RequestInit = {}) => {
    try {
        const { accessToken } = await GoogleSignin.getTokens();
        const headers = { ...options.headers, 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' };
        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
            const errorBody = await response.json();
            logger.error(`API request to ${url} failed with status ${response.status}`, errorBody);
            throw new Error(`API Error: ${errorBody.error.message}`);
        }
        if (response.status === 204) return null; // No Content
        return response.json();
    } catch (error) {
        logger.error('Failed to make authorized fetch call.', error);
        throw error;
    }
};

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const fetchBroadcasts = (): Promise<LiveBroadcastListResponse> => {
    const url = `${YOUTUBE_API_BASE_URL}/liveBroadcasts?part=snippet,contentDetails,status&broadcastStatus=all&mine=true`;
    return authorizedFetch(url, { method: 'GET' });
};

export const scheduleBroadcast = (details: { title: string; description: string; scheduledTime: string }): Promise<LiveBroadcast> => {
    const url = `${YOUTUBE_API_BASE_URL}/liveBroadcasts?part=snippet,contentDetails,status`;
    const body: ScheduleBroadcastRequest = {
        snippet: {
            title: details.title,
            description: details.description,
            scheduledStartTime: new Date(details.scheduledTime).toISOString(),
        },
        contentDetails: {
            enableAutoStart: true,
            enableAutoStop: true,
            enableDvr: true,
            recordFromStart: true,
        },
        status: {
            privacyStatus: 'public',
            selfDeclaredMadeForKids: false,
        },
    };
    return authorizedFetch(url, { method: 'POST', body: JSON.stringify(body) });
};