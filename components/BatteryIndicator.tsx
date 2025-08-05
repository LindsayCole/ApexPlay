import React from 'react';
import { View, Text } from 'react-native';
import { BatteryIcon, BoltIcon } from './Icons';

interface BatteryIndicatorProps {
  level: number;
  charging: boolean;
  isSupported: boolean;
}

export const BatteryIndicator: React.FC<BatteryIndicatorProps> = ({ level, charging, isSupported }) => {
  if (!isSupported) {
    return null;
  }

  const percentage = Math.round(level * 100);

  const getStatusColor = () => {
    if (charging) return '#FBBF24'; // yellow-400
    if (percentage <= 20) return '#EF4444'; // red-500
    return '#4ADE80'; // green-400
  };
  
  const color = getStatusColor();

  return (
    <View className="bg-black/70 px-3 py-1 rounded-lg flex-row items-center space-x-2 shadow-lg border border-white/10">
      <View className="relative flex-row items-center justify-center">
        {charging && <BoltIcon size={16} color={color} />}
        <BatteryIcon size={20} color={color} />
      </View>
      <Text className="font-mono text-xs" style={{color}}>{percentage}%</Text>
    </View>
  );
};