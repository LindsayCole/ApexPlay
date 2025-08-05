import { describe, it, expect } from '@jest/globals';
import { sanitize } from '../../services/loggingService';

describe('loggingService.sanitize', () => {
    it('should not alter simple strings', () => {
        expect(sanitize('Hello world')).toBe('Hello world');
    });

    it('should not alter simple objects', () => {
        const obj = { a: 1, b: 'test' };
        expect(sanitize(obj)).toBe(JSON.stringify(obj));
    });

    it('should redact sensitive keys from objects', () => {
        const sensitiveObj = {
            user: 'test',
            apiKey: 'SHOULD_BE_REDACTED_12345',
            stream: {
                key: 'SHOULD_ALSO_BE_REDACTED_ABCDE'
            },
            normalKey: 'should be visible'
        };
        const result = JSON.parse(sanitize(sensitiveObj));
        expect(result.apiKey).toBe('[REDACTED]');
        expect(result.stream.key).toBe('[REDACTED]');
        expect(result.normalKey).toBe('should be visible');
    });

    it('should redact sensitive keys regardless of case', () => {
        const sensitiveObj = {
            APIKEY: 'SHOULD_BE_REDACTED_12345',
            'IdToken': 'long.jwt.token'
        };
         const result = JSON.parse(sanitize(sensitiveObj));
        expect(result.APIKEY).toBe('[REDACTED]');
        expect(result.IdToken).toBe('[REDACTED]');
    });

    it('should redact RTMP URLs with stream keys', () => {
        const urlWithKey = 'rtmp://a.rtmp.youtube.com/live2/abc-123-def-456';
        expect(sanitize(urlWithKey)).toBe('rtmp://a.rtmp.youtube.com/live2/[REDACTED]');
    });

    it('should redact RTMPS URLs from Twitch', () => {
        const urlWithKey = 'rtmps://ingest.twitch.tv/app/live_12345_key';
        expect(sanitize(urlWithKey)).toBe('rtmps://ingest.twitch.tv/app/[REDACTED]');
    });

    it('should redact long JWT-like strings', () => {
        const longToken = 'ya29.a0AfH6SMD-long-google-oauth-token-string-that-is-very-long-and-sensitive';
        const result = sanitize({ myToken: longToken });
        expect(JSON.parse(result).myToken).toBe('[REDACTED]');
    });
    
    it('should handle Error objects gracefully', () => {
        const error = new Error('Something went wrong');
        const result = JSON.parse(sanitize(error));
        expect(result.name).toBe('Error');
        expect(result.message).toBe('Something went wrong');
        expect(result.stack).toBeDefined();
    });

    it('should handle non-serializable objects', () => {
        const obj: any = {};
        obj.a = { b: obj }; // Circular reference
        expect(sanitize(obj)).toBe('[Unserializable Object]');
    });

    it('should handle null and undefined', () => {
        expect(sanitize(null)).toBe('null');
        expect(sanitize(undefined)).toBe('undefined');
    });
});