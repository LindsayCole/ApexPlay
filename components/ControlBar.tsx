import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { PlayIcon, StopIcon, SettingsIcon, BroadcastIcon, HockeyPuckIcon, MicrophoneIcon, MicrophoneOffIcon, CameraFlipIcon } from './Icons';

interface ControlBarProps {
  isStreaming: boolean;
  isLive: boolean;
  isMuted: boolean;
  isLiveDisabled: boolean;
  onToggleStreaming: () => void;
  onToggleLive: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onShowSettings: () => void;
  onShowControls: () => void;
}

const ControlBarComponent: React.FC<ControlBarProps> = ({
  isStreaming,
  isLive,
  isMuted,
  isLiveDisabled,
  onToggleStreaming,
  onToggleLive,
  onToggleMute,
  onToggleCamera,
  onShowSettings,
  onShowControls,
}) => {
  return (
    <View className="absolute bottom-5 z-20 w-full flex-row justify-center px-4">
      <View className="flex-row items-center justify-around w-full max-w-xl h-20 bg-black/50 rounded-full border border-white/20 shadow-2xl px-4">
        <Pressable
          onPress={onToggleStreaming}
          disabled={isLive}
          className="flex-col items-center justify-center w-20 text-xs font-semibold transition-opacity duration-200 disabled:opacity-40"
          aria-label={isStreaming ? "Turn camera off" : "Turn camera on"}
        >
          {isStreaming ? (
            <>
              <StopIcon size={28} color="#F87171" />
              <Text className="text-white text-xs font-semibold">Turn Off</Text>
            </>
          ) : (
            <>
              <PlayIcon size={28} color="#4ADE80" />
              <Text className="text-white text-xs font-semibold">Turn On</Text>
            </>
          )}
        </Pressable>
        
        <Pressable
          onPress={onToggleLive}
          disabled={isLiveDisabled}
          className={`flex-row items-center justify-center space-x-2 w-28 h-14 rounded-full transition-all duration-300 disabled:bg-gray-500 disabled:opacity-60 ${
            isLive ? 'bg-red-600' : 'bg-blue-600'
          }`}
          aria-live="polite"
          aria-label={isLive ? "End broadcast" : "Start broadcast"}
        >
          <BroadcastIcon size={24} color="#FFF" />
          <Text className="text-lg text-white font-semibold">{isLive ? "End" : "Live"}</Text>
        </Pressable>

        <Pressable
          onPress={onToggleMute}
          disabled={!isStreaming}
          className="flex-col items-center justify-center w-20 text-xs font-semibold disabled:opacity-40"
          aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
        >
          {isMuted ? (
            <>
              <MicrophoneOffIcon size={28} color="#FBBF24" />
              <Text className="text-white text-xs font-semibold">Unmute</Text>
            </>
          ) : (
            <>
              <MicrophoneIcon size={28} color="#FFF" />
              <Text className="text-white text-xs font-semibold">Mute</Text>
            </>
          )}
        </Pressable>

        <View className="flex-row items-center space-x-2">
            <Pressable
                onPress={onToggleCamera}
                disabled={!isStreaming || isLive}
                className="items-center justify-center w-12 h-12 rounded-full bg-gray-600/50 disabled:opacity-40"
                aria-label="Switch camera"
                >
                <CameraFlipIcon size={24} color="#FFF"/>
            </Pressable>
            <Pressable
                onPress={onShowControls}
                className="items-center justify-center w-12 h-12 rounded-full bg-gray-600/50"
                aria-label="Open game controls"
                >
                <HockeyPuckIcon size={28} color="#FFF"/>
            </Pressable>
            <Pressable
                onPress={onShowSettings}
                className="items-center justify-center w-12 h-12 rounded-full bg-gray-600/50"
                aria-label="Open settings"
                >
                <SettingsIcon size={24} color="#FFF"/>
            </Pressable>
        </View>
      </View>
    </View>
  );
};

export const ControlBar = React.memo(ControlBarComponent);