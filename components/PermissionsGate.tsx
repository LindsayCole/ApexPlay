import React from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { CameraIcon, MicrophoneIcon, SparklesIcon, FolderIcon } from './Icons';

interface PermissionsGateProps {
  onGrant: () => void;
  status: { [key: string]: string };
}

export const PermissionsGate: React.FC<PermissionsGateProps> = ({ onGrant, status }) => {
  const wasDenied = status.camera === 'denied' || status.camera === 'blocked' || status.microphone === 'denied' || status.microphone === 'blocked' || status.storage === 'denied' || status.storage === 'blocked';
  
  const openSettings = () => {
    Linking.openSettings();
  };

  return (
    <View className="flex-1 bg-gray-900 items-center justify-center p-8">
      <SparklesIcon size={64} color="#A78BFA" />
      <Text className="text-3xl font-bold text-white mt-6 mb-4 text-center">Welcome to Apex Play</Text>
      <Text className="max-w-md text-gray-300 mb-8 text-center">
        {wasDenied
          ? "Core permissions are required to continue. Please grant access in your device settings."
          : "To get started, please grant access to your camera, microphone, and storage."}
      </Text>
      <View className="flex-row space-x-6 text-gray-400 mb-10">
        <View className="flex-row items-center space-x-2">
          <CameraIcon size={24} color={status.camera === 'granted' ? '#4ADE80' : '#9CA3AF'} />
          <Text className="text-white">Camera</Text>
        </View>
        <View className="flex-row items-center space-x-2">
          <MicrophoneIcon size={24} color={status.microphone === 'granted' ? '#4ADE80' : '#9CA3AF'}/>
          <Text className="text-white">Microphone</Text>
        </View>
         <View className="flex-row items-center space-x-2">
          <FolderIcon size={24} color={status.storage === 'granted' ? '#4ADE80' : '#9CA3AF'}/>
          <Text className="text-white">Storage</Text>
        </View>
      </View>
      <Pressable
        onPress={wasDenied ? openSettings : onGrant}
        className="bg-purple-600 active:bg-purple-700 py-3 px-8 rounded-full"
      >
        <Text className="text-white font-bold text-lg">
          {wasDenied ? 'Open Settings' : 'Allow Access'}
        </Text>
      </Pressable>
       <Text className="text-xs text-gray-500 mt-8 max-w-md text-center">
        You can manage permissions in your device settings at any time. Storage access is needed for the logo library.
      </Text>
    </View>
  );
};
