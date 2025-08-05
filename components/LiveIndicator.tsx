import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, interpolate, Extrapolate } from 'react-native-reanimated';

interface LiveIndicatorProps {
  isLive: boolean;
}

export const LiveIndicator: React.FC<LiveIndicatorProps> = ({ isLive }) => {
  const [duration, setDuration] = useState<string>('00:00:00');
  const pulse = useSharedValue(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isLive) {
      const startTime = Date.now();
      interval = setInterval(() => {
        const totalSeconds = Math.floor((Date.now() - startTime) / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        setDuration(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      }, 1000);

      pulse.value = withRepeat(withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }), -1, true);

    } else {
      setDuration('00:00:00');
      pulse.value = 0;
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLive, pulse]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(pulse.value, [0, 1], [0.5, 1], Extrapolate.CLAMP);
    return { opacity };
  });

  if (!isLive) return null;

  return (
    <View className="absolute top-4 left-4 z-30 bg-red-600 px-3 py-1 rounded-lg flex-row items-center shadow-lg">
      <Animated.View style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: 'white', marginRight: 8 }, animatedStyle]} />
      <Text className="text-white font-bold text-sm">LIVE</Text>
      <Text className="text-white font-mono text-sm ml-2">{duration}</Text>
    </View>
  );
};
