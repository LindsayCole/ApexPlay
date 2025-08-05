import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { ChevronUpIcon, ChevronDownIcon } from './Icons';

interface TimeSelectorProps {
    label: string;
    value: number;
    setValue: (value: number) => void;
    max: number;
    min?: number;
    size?: 'normal' | 'small';
}

export const TimeSelector: React.FC<TimeSelectorProps> = ({ label, value, setValue, max, min = 0, size = 'normal' }) => {
    
    const clampedSetValue = (newValue: number) => {
        const clamped = Math.round(Math.max(min, Math.min(max, newValue)));
        if (clamped !== value) {
            setValue(clamped);
        }
    };

    const isSmall = size === 'small';
    const radius = isSmall ? 30 : 36;
    const strokeWidth = isSmall ? 6 : 8;
    const circumference = 2 * Math.PI * radius;
    const progress = max > min ? (value - min) / (max - min) : 0;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <View className={`flex-col items-center justify-center space-y-1 py-2 ${isSmall ? 'w-24' : 'w-28'}`}>
            <Pressable
                onPressIn={() => clampedSetValue(value + 1)}
                onLongPress={() => clampedSetValue(value + 5)}
                className={`relative rounded-full flex items-center justify-center bg-gray-800/80 border-2 shadow-inner group transition-all duration-200 ${isSmall ? 'w-20 h-20' : 'w-24 h-24'} border-gray-700`}
            >
                <Svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <Circle cx="50" cy="50" r={radius} strokeWidth={strokeWidth} stroke="#374151" fill="none" />
                    <Circle
                        cx="50" cy="50" r={radius}
                        strokeWidth={strokeWidth}
                        stroke="#a855f7"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                    />
                </Svg>
                <Text className={`font-mono font-bold text-white z-10 ${isSmall ? 'text-3xl' : 'text-4xl'}`}>
                    {String(value).padStart(2, '0')}
                </Text>
            </Pressable>
            <View className="flex-row w-full justify-around pt-1">
                 <Pressable onPress={() => clampedSetValue(value - 1)} className="p-1"><ChevronDownIcon color="#9ca3af" size={isSmall ? 20 : 24}/></Pressable>
                 <Text className="text-xs text-gray-400 uppercase font-semibold tracking-wider self-center">{label}</Text>
                 <Pressable onPress={() => clampedSetValue(value + 1)} className="p-1"><ChevronUpIcon color="#9ca3af" size={isSmall ? 20 : 24}/></Pressable>
            </View>
        </View>
    );
};