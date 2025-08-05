


import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import type { Team } from '../App';

export interface Banner { text: string; isVisible: boolean; isBold: boolean; isRed: boolean; }
export interface ScoreboardSettings { position: { x: number; y: number }; style: { backgroundColor: string }; scale: number; }
interface ScoreboardProps {
    team1: Team; team2: Team; period: number; gameClock: number;
    settings: ScoreboardSettings;
    onSettingsChange: (settings: ScoreboardSettings) => void;
    gameTitleBanner: Banner; banner1: Banner; banner2: Banner;
    powerPlayStatus: 'none' | 'pp' | 'pk';
    penaltyClock: number;
}

const BannerDisplay: React.FC<{ banner: Banner }> = ({ banner }) => {
    if (!banner.isVisible || !banner.text) return null;
    return (
        <View className={`px-2 py-1`}>
            <Text className={`text-center text-lg uppercase tracking-wider ${banner.isRed ? 'text-red-500' : 'text-white'} ${banner.isBold ? 'font-extrabold' : 'font-semibold'}`}>
                {banner.text}
            </Text>
        </View>
    )
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ team1, team2, period, gameClock, settings, onSettingsChange, gameTitleBanner, banner1, banner2, powerPlayStatus, penaltyClock }) => {
    const translateX = useSharedValue(settings.position.x);
    const translateY = useSharedValue(settings.position.y);
    const scale = useSharedValue(settings.scale);

    // Sync shared values with props, as useSharedValue initializes only once.
    useEffect(() => {
        translateX.value = settings.position.x;
        translateY.value = settings.position.y;
    }, [settings.position.x, settings.position.y, translateX, translateY]);
    
    useEffect(() => {
        scale.value = withSpring(settings.scale);
    }, [settings.scale, scale]);

    const startX = useSharedValue(0);
    const startY = useSharedValue(0);

    const panGesture = Gesture.Pan()
      .onStart(() => {
        startX.value = translateX.value;
        startY.value = translateY.value;
      })
      .onUpdate((event) => {
        translateX.value = startX.value + event.translationX;
        translateY.value = startY.value + event.translationY;
      })
      .onEnd(() => {
        runOnJS(onSettingsChange)({ ...settings, position: { x: translateX.value, y: translateY.value }});
      });

    const animatedStyle = useAnimatedStyle((): ViewStyle => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scale: scale.value }
            ],
        };
    });

    const minutes = String(Math.floor(gameClock / 60)).padStart(2, '0');
    const seconds = String(gameClock % 60).padStart(2, '0');
    const periodDisplay = period <= 3 ? `PERIOD ${period}` : (period === 4 ? `OT` : `${period - 3}OT`);
    
    const formatPenaltyTime = (time: number) => `${String(Math.floor(time / 60))}:${String(time % 60).padStart(2, '0')}`;

    const isTitleVisible = gameTitleBanner.isVisible && gameTitleBanner.text;
    const isPPVisible = powerPlayStatus !== 'none';
    
    return (
        <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.container, animatedStyle]}>
                <View className="flex flex-col shadow-lg">
                    {isTitleVisible && (
                        <View className="p-1.5 rounded-t-lg" style={{ backgroundColor: settings.style.backgroundColor }}>
                             <Text className={`text-base tracking-wider text-center uppercase ${gameTitleBanner.isBold ? 'font-bold' : 'font-semibold'} ${gameTitleBanner.isRed ? 'text-red-500' : 'text-white'}`}>
                                {gameTitleBanner.text}
                            </Text>
                        </View>
                    )}
                    <View className={`p-2 ${isTitleVisible ? (isPPVisible ? '' : 'rounded-b-lg') : (isPPVisible ? 'rounded-t-lg' : 'rounded-lg')}`} style={{ backgroundColor: settings.style.backgroundColor }}>
                        <View className="flex-row items-center justify-center text-white font-bold px-4 space-x-4">
                            <View className="flex-row items-center space-x-3 w-1/3">
                                {team1.logo && <Image source={{ uri: team1.logo }} style={styles.logo} />}
                                <Text className="text-xl whitespace-nowrap" style={{ color: team1.color }}>{team1.name.toUpperCase()}</Text>
                            </View>
                            <Text className="text-4xl w-16 text-center">{team1.score}</Text>
                            <View className="flex-col items-center">
                                <Text className="text-4xl font-mono">{`${minutes}:${seconds}`}</Text>
                                <Text className="text-sm font-semibold tracking-widest">{periodDisplay}</Text>
                            </View>
                            <Text className="text-4xl w-16 text-center">{team2.score}</Text>
                            <View className="flex-row items-center justify-end space-x-3 w-1/3">
                                <Text className="text-xl text-right whitespace-nowrap" style={{ color: team2.color }}>{team2.name.toUpperCase()}</Text>
                                {team2.logo && <Image source={{ uri: team2.logo }} style={styles.logo} />}
                            </View>
                        </View>
                    </View>
                    {isPPVisible && (
                        <View className={`rounded-b-lg uppercase font-extrabold text-sm py-1 flex-row justify-between items-center px-3 ${powerPlayStatus === 'pp' ? 'bg-yellow-500' : 'bg-blue-600'}`}>
                            <Text className={`tracking-wider ${powerPlayStatus === 'pp' ? 'text-black' : 'text-white'}`}>
                                {powerPlayStatus === 'pp' ? 'Power Play' : 'Penalty Kill'}
                            </Text>
                            {penaltyClock > 0 && (
                                <View className="bg-black/25 rounded-md px-2 py-0.5">
                                    <Text className="font-mono text-base font-bold text-white normal-case">{formatPenaltyTime(penaltyClock)}</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
                {(banner1.isVisible || banner2.isVisible) && (
                    <View className="mt-1 rounded-lg w-full shadow-lg" style={{ backgroundColor: settings.style.backgroundColor }}>
                        <BannerDisplay banner={banner1} />
                        <BannerDisplay banner={banner2} />
                    </View>
                )}
            </Animated.View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    container: { position: 'absolute', top: 0, left: 0, zIndex: 10, },
    logo: { width: 40, height: 40, resizeMode: 'contain' }
});