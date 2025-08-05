/**
 * @file loggingService.ts
 * @version 2.0.1
 * @author WeirdGoalieDad / Lindsay Cole
 * @dedication For Caden and Ryker.
 * @description Provides a persistent, sanitized logging utility for the native application.
 */

import { addLogEntry } from './dbService';
import type { PlainLogEntry } from './dbService';

type LogLevel = 'info' | 'warn' | 'error';

interface LogQueueItem {
    level: LogLevel,
    message: string,
    timestamp: number
}

const SENSITIVE_KEYS = ['key', 'apiKey', 'clientId', 'YOUTUBE_API_KEY', 'YOUTUBE_CLIENT_ID', 'idToken', 'accessToken'];
const SANITIZED_REPLACEMENT = '[REDACTED]';

let logQueue: LogQueueItem[] = [];
let isDbReady = false;
let isProcessing = false;

/**
 * Sanitizes log data to remove sensitive information before storage.
 * It redacts values associated with sensitive keys and parts of specific string patterns.
 * Exported for testing purposes.
 * @param data The data to sanitize.
 * @returns A string representation of the sanitized data.
 */
export const sanitize = (data: unknown): string => {
    if (typeof data === 'string') {
        return data.replace(/(\/live2\/|app\/)([\w-]+)/, `$1${SANITIZED_REPLACEMENT}`);
    }
    if (typeof data === 'object' && data !== null) {
        try {
            if (data instanceof Error) {
                return JSON.stringify({ name: data.name, message: data.message, stack: data.stack?.split('\n')[0] });
            }
            const str = JSON.stringify(data, (key, value) => {
                if (typeof key === 'string' && SENSITIVE_KEYS.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
                    return SANITIZED_REPLACEMENT;
                }
                if (typeof value === 'string' && value.length > 50) {
                    if (value.startsWith('ya29.') || value.startsWith('ey')) return SANITIZED_REPLACEMENT;
                    if (value.startsWith('rtmp')) return value.replace(/(\/live2\/|app\/)([\w-]+)/, `$1${SANITIZED_REPLACEMENT}`);
                }
                return value;
            });
            return str;
        } catch {
            return '[Unserializable Object]';
        }
    }
    return String(data);
};

const processQueue = async () => {
    if (isProcessing || logQueue.length === 0) return;
    isProcessing = true;
    const itemsToProcess = [...logQueue];
    logQueue = [];
    for (const item of itemsToProcess) {
        try {
            await addLogEntry(item as Omit<PlainLogEntry, 'id'>);
        } catch (e) {
            console.error('Failed to write queued log to DB:', e);
            logQueue.push(item); // Re-queue on failure
        }
    }
    isProcessing = false;
};

const _log = (level: LogLevel, message: string, ...args: unknown[]) => {
    const timestamp = Date.now();
    const sanitizedArgs = args.map(sanitize).join(' ');
    const fullMessage = `${message} ${sanitizedArgs}`.trim();
    
    const consoleTimestamp = new Date(timestamp).toISOString();
    console[level](`[${level.toUpperCase()}] ${consoleTimestamp}: ${fullMessage}`);

    const logEntry: LogQueueItem = { level, message: fullMessage, timestamp };

    logQueue.push(logEntry);
    if (isDbReady) {
        processQueue();
    }
};

export const logger = {
    init: async () => {
        isDbReady = true;
        logger.info('Logger initialized, processing queue.');
        await processQueue();
    },
    info: (message: string, ...args: unknown[]) => _log('info', message, ...args),
    warn: (message: string, ...args: unknown[]) => _log('warn', message, ...args),
    error: (message: string, ...args: unknown[]) => _log('error', message, ...args),
};