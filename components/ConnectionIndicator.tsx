import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ConnectionIndicatorProps {
  status: 'connecting' | 'connected' | 'closed' | 'failed';
}

const SignalIcon: React.FC<{ status: ConnectionIndicatorProps['status'] }> = ({ status }) => {
  const barColorClass = status === 'connected' ? 'bg-green-400' : status === 'failed' ? 'bg-red-500' : 'bg-yellow-400';
  const inactiveBarColorClass = 'bg-gray-600';

  return (
    <View className="w-5 h-4 flex-row items-end justify-between">
      <View className={`w-1 rounded-sm h-1/4 ${status !== 'closed' ? barColorClass : inactiveBarColorClass}`} />
      <View className={`w-1 rounded-sm h-1/2 ${status === 'connected' ? barColorClass : inactiveBarColorClass}`} />
      <View className={`w-1 rounded-sm h-3/4 ${status === 'connected' ? barColorClass : inactiveBarColorClass}`} />
      <View className={`w-1 rounded-sm h-full ${status === 'connected' ? barColorClass : inactiveBarColorClass}`} />
    </View>
  );
};

export const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({ status }) => {
  if (status === 'closed') return null;

  const statusMap = {
    connecting: { text: "Connecting", color: "text-yellow-400" },
    connected: { text: "Good", color: "text-green-400" },
    failed: { text: "Failed", color: "text-red-500" },
    closed: {text: "Offline", color: "text-gray-400"},
  };

  const currentStatus = statusMap[status];

  return (
    <View className="bg-black/70 px-3 py-1 rounded-lg flex-row items-center space-x-2 shadow-lg border border-white/10">
      <SignalIcon status={status} />
      <Text className={`text-xs font-semibold ${currentStatus.color}`}>{currentStatus.text}</Text>
    </View>
  );
};