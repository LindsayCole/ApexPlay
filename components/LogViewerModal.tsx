import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal, ScrollView, Share, Alert, Clipboard } from 'react-native';
import { XIcon, ShareIcon, TrashIcon } from './Icons';
import { getLogEntries, clearAllLogEntries, PlainLogEntry } from '../services/dbService';
import { logger } from '../services/loggingService';

interface LogViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LogViewerModal: React.FC<LogViewerModalProps> = ({ isOpen, onClose }) => {
    const [logs, setLogs] = useState<PlainLogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadLogs = async () => {
        setIsLoading(true);
        try {
            const storedLogs = await getLogEntries();
            setLogs(storedLogs.sort((a, b) => b.timestamp - a.timestamp)); // Show newest first
        } catch (error) {
            logger.error('Failed to load logs from DB', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadLogs();
        }
    }, [isOpen]);

    const formatLogsForShare = () => {
        return logs
            .map(log => `[${new Date(log.timestamp).toISOString()}] [${log.level.toUpperCase()}] ${log.message}`)
            .join('\n');
    };

    const handleShare = async () => {
        const logText = formatLogsForShare();
        try {
            await Share.share({
                title: 'Apex Play Diagnostic Log',
                message: logText,
            });
            logger.info('Log shared successfully via Share API.');
        } catch (error) {
            logger.error('Share API failed, falling back to clipboard.', error);
            Clipboard.setString(logText);
            Alert.alert('Copied to Clipboard', 'Log content has been copied to your clipboard.');
        }
    };
    
    const handleClearLogs = async () => {
        Alert.alert('Clear Logs', 'Are you sure you want to permanently delete all log entries?', [
            { text: 'Cancel', style: 'cancel'},
            { text: 'Delete', style: 'destructive', onPress: async () => {
                try {
                    await clearAllLogEntries();
                    setLogs([]);
                    logger.info('All logs have been cleared.');
                } catch (error) {
                    logger.error('Failed to clear logs', error);
                }
            }}
        ]);
    };

    const getLevelColor = (level: PlainLogEntry['level']) => {
        switch (level) {
            case 'error': return 'text-red-400';
            case 'warn': return 'text-yellow-400';
            default: return 'text-gray-300';
        }
    };

    return (
        <Modal
            visible={isOpen}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable
                className="flex-1 bg-black/60 justify-center items-center p-4"
                onPress={onClose}
            >
                <Pressable className="bg-gray-800 rounded-2xl w-full max-w-2xl border border-gray-700 flex-col h-[80vh]" onPress={(e) => e.stopPropagation()}>
                    <View className="p-4 border-b border-gray-700 flex-row justify-between items-center">
                        <Text className="text-xl font-bold text-white">Diagnostic Log</Text>
                        <Pressable onPress={onClose} className="p-1 rounded-full bg-gray-700"><XIcon size={20} color="white" /></Pressable>
                    </View>

                    <ScrollView className="p-4 flex-1" contentContainerStyle={{flexGrow: 1}}>
                        {isLoading ? (
                            <Text className="text-center text-gray-400">Loading logs...</Text>
                        ) : logs.length === 0 ? (
                            <Text className="text-center text-gray-400">No log entries found.</Text>
                        ) : (
                            logs.map(log => (
                                <View key={log.id} className={`flex-row items-start my-0.5`}>
                                    <Text className="text-gray-500 mr-2 font-mono text-xs">{new Date(log.timestamp).toLocaleTimeString()}</Text>
                                    <Text className={`flex-1 font-mono text-xs ${getLevelColor(log.level)}`}>{log.message}</Text>
                                </View>
                            ))
                        )}
                    </ScrollView>

                    <View className="p-4 border-t border-gray-700 flex-row justify-between items-center">
                        <Pressable onPress={handleClearLogs} className="flex-row items-center space-x-2 px-3 py-2 bg-gray-700 active:bg-red-800 rounded-lg">
                            <TrashIcon size={16} color="#d1d5db"/>
                            <Text className="text-xs font-semibold text-gray-300">Clear Log</Text>
                        </Pressable>
                        <Pressable onPress={handleShare} className="flex-row items-center space-x-2 px-4 py-2 bg-purple-600 active:bg-purple-700 rounded-lg">
                            <ShareIcon size={20} color="white"/>
                            <Text className="text-sm font-semibold text-white">Share</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </View>
        </Modal>
    );
};