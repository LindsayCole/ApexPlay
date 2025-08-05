import React from 'react';
import { View, Pressable } from 'react-native';
import Slider from '@react-native-community/slider';
import { PlusIcon, MinusIcon } from './Icons';

interface ZoomSliderProps {
    value: number;
    onChange: (newValue: number) => void;
    min: number;
    max: number;
    step: number;
}

export const ZoomSlider: React.FC<ZoomSliderProps> = ({ value, onChange, min, max, step }) => {
    
    const handleIncrease = () => {
        const nextValue = value + step;
        onChange(Math.min(nextValue, max));
    };

    const handleDecrease = () => {
        const nextValue = value - step;
        onChange(Math.max(nextValue, min));
    };
    
    return (
        <View className="absolute top-1/4 right-2 h-1/2 flex-col items-center bg-black/50 rounded-full border border-white/20 shadow-xl p-2 justify-between">
            <Pressable
                onPress={handleIncrease}
                disabled={value >= max}
                className="p-2 rounded-full disabled:opacity-50"
            >
                <PlusIcon size={20} color="white" />
            </Pressable>
            <View style={{ height: '70%', width: 40, alignItems: 'center', justifyContent: 'center' }}>
                 <Slider
                    style={{ height: 40, width: '100%', transform: [{ rotate: '-90deg' }] }}
                    minimumValue={min}
                    maximumValue={max}
                    step={step}
                    value={value}
                    onValueChange={onChange}
                    thumbTintColor="#a855f7"
                    minimumTrackTintColor="rgba(255, 255, 255, 0.3)"
                    maximumTrackTintColor="#a855f7"
                />
            </View>
            <Pressable
                onPress={handleDecrease}
                disabled={value <= min}
                className="p-2 rounded-full disabled:opacity-50"
            >
                <MinusIcon size={20} color="white" />
            </Pressable>
        </View>
    );
};