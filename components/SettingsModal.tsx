import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, ScrollView, TextInput, Switch, Image, Alert, FlatList } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { APP_VERSION } from '../config';
import type { BitrateQuality, VIDEO_QUALITIES, QualityKey, OrientationLockType } from '../App';
import { BroadcastIcon, CameraIcon, TrashIcon, PencilIcon, PlusIcon, EyeIcon, EyeOffIcon, CalendarPlusIcon, ChevronDownIcon, XIcon, CheckIcon } from './Icons';
import type { StreamDestinationPlain, StreamDestinationData } from '../services/dbService';
import type { UserInfo, LiveBroadcast } from '../services/youtubeService';

type SettingsTab = 'stream' | 'quality';
type DestinationMode = 'view' | 'add' | 'edit';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowLogViewer: () => void;
  recordLocally: boolean;
  setRecordLocally: (value: boolean) => void;
  rememberSettings: boolean;
  setRememberSettings: (value: boolean) => void;
  streamQuality: QualityKey;
  setStreamQuality: (value: QualityKey) => void;
  recordQuality: QualityKey;
  setRecordQuality: (value: QualityKey) => void;
  fps: number;
  setFps: (value: number) => void;
  bitrateQuality: BitrateQuality;
  setBitrateQuality: (value: BitrateQuality) => void;
  orientationLock: OrientationLockType;
  setOrientationLock: (value: OrientationLockType) => void;
  videoQualities: typeof VIDEO_QUALITIES;
  streamDestinations: StreamDestinationPlain[];
  activeStreamDestinationId: number | null;
  setActiveStreamDestinationId: (id: number | null) => void;
  onAddDestination: (data: StreamDestinationData) => Promise<void>;
  onUpdateDestination: (data: StreamDestinationPlain) => Promise<void>;
  onDeleteDestination: (id: number) => Promise<void>;
  isAuthed: boolean;
  userInfo: UserInfo | null;
  onSignIn: () => void;
  onSignOut: () => void;
  youtubeBroadcasts: LiveBroadcast[];
  activeYoutubeBroadcast: LiveBroadcast | null;
  setActiveYoutubeBroadcast: (broadcast: LiveBroadcast | null) => void;
  onScheduleStream: (details: { title: string; description: string; scheduledTime: string }) => Promise<void>;
}

const DestinationEditor: React.FC<{ mode: DestinationMode; destination: StreamDestinationPlain | StreamDestinationData | null; onSave: (data: StreamDestinationPlain | StreamDestinationData) => void; onCancel: () => void; }> = ({ mode, destination, onSave, onCancel }) => {
    const [name, setName] = useState(destination?.name || '');
    const [url, setUrl] = useState(destination?.url || '');
    const [key, setKey] = useState(destination?.key || '');

    const handleSave = () => {
        if (!name.trim() || !url.trim()) { Alert.alert('Error','Name and URL are required.'); return; }
        onSave({ ...destination, name, url, key } as StreamDestinationPlain | StreamDestinationData);
    };

    return (
        <View className="bg-gray-900/70 p-4 rounded-lg space-y-4">
            <Text className="font-semibold text-lg text-white">{mode === 'add' ? 'Add New Destination' : 'Edit Destination'}</Text>
            <View>
                <Text className="text-sm font-medium text-gray-300 mb-1">Name</Text>
                <TextInput value={name} onChangeText={setName} placeholder="e.g., Twitch" className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg px-3 py-2 text-sm" />
            </View>
            <View>
                <Text className="text-sm font-medium text-gray-300 mb-1">Stream URL</Text>
                <TextInput value={url} onChangeText={setUrl} placeholder="rtmp://..." className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg px-3 py-2 text-sm" />
            </View>
            <View>
                <Text className="text-sm font-medium text-gray-300 mb-1">Stream Key</Text>
                <TextInput secureTextEntry value={key} onChangeText={setKey} placeholder="Keep it secret!" className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg px-3 py-2 text-sm" />
            </View>
            <View className="flex-row justify-end space-x-3">
                <Pressable onPress={onCancel} className="px-4 py-2 bg-gray-700 rounded-lg"><Text className="text-sm font-medium text-gray-300">Cancel</Text></Pressable>
                <Pressable onPress={handleSave} className="px-4 py-2 bg-purple-600 rounded-lg"><Text className="text-sm font-medium text-white">Save</Text></Pressable>
            </View>
        </View>
    );
};

const ScheduleStreamForm: React.FC<{ onSchedule: (details: { title: string; description: string; scheduledTime: string }) => void; onCancel: () => void; }> = ({ onSchedule, onCancel }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date(Date.now() + 15 * 60 * 1000));
    const [showPicker, setShowPicker] = useState(false);

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        setShowPicker(false);
        setDate(currentDate);
    };

    const handleSubmit = () => {
        if (!title.trim()) { Alert.alert('Error', 'Title is required.'); return; }
        onSchedule({ title, description, scheduledTime: date.toISOString() });
    };

    return (
        <View className="bg-gray-900/70 p-4 rounded-lg space-y-4">
            <Text className="font-semibold text-lg text-white">Schedule New YouTube Stream</Text>
            <TextInput value={title} onChangeText={setTitle} placeholder="Stream Title" className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg px-3 py-2 text-sm" />
            <TextInput multiline value={description} onChangeText={setDescription} placeholder="Stream Description" numberOfLines={3} className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg px-3 py-2 text-sm" />
            
            <View>
                <Text className="text-sm font-medium text-gray-300 mb-1">Scheduled Time</Text>
                <Pressable onPress={() => setShowPicker(true)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5">
                    <Text className="text-white text-sm">{date.toLocaleString()}</Text>
                </Pressable>
            </View>

            {showPicker && (
                <DateTimePicker
                    value={date}
                    mode="datetime"
                    display="default"
                    onChange={onDateChange}
                />
            )}

            <View className="flex-row justify-end space-x-3">
                <Pressable onPress={onCancel} className="px-4 py-2 bg-gray-700 rounded-lg"><Text className="text-sm font-medium text-gray-300">Cancel</Text></Pressable>
                <Pressable onPress={handleSubmit} className="px-4 py-2 bg-purple-600 rounded-lg"><Text className="text-sm font-medium text-white">Schedule</Text></Pressable>
            </View>
        </View>
    );
};

export const SettingsModal: React.FC<SettingsModalProps> = (props) => {
  const { isOpen, onClose, ...p } = props;
  const [activeTab, setActiveTab] = useState<SettingsTab>('stream');
  const [destinationMode, setDestinationMode] = useState<DestinationMode>('view');
  const [editingDestination, setEditingDestination] = useState<StreamDestinationPlain | StreamDestinationData | null>(null);
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [isDestinationPickerOpen, setIsDestinationPickerOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('stream');
      setDestinationMode('view');
      setIsKeyVisible(false);
      setShowScheduleForm(false);
    }
  }, [isOpen]);
  
  /**
   * Handles saving a new or edited stream destination.
   * This function is now strongly typed to only accept valid destination data.
   * @param data The stream destination data to save.
   */
  const handleDestinationSave = async (data: StreamDestinationPlain | StreamDestinationData) => { 
    'id' in data ? await p.onUpdateDestination(data) : await p.onAddDestination(data); 
    setDestinationMode('view'); 
  };

  const handleDeleteClick = () => { if (p.activeStreamDestinationId) Alert.alert("Delete Destination", "Are you sure you want to delete this destination?", [{text: 'Cancel', style: 'cancel'}, {text: 'Delete', style: 'destructive', onPress: () => p.onDeleteDestination(p.activeStreamDestinationId!)}]); };
  
  /**
   * Handles submitting the form to schedule a new YouTube stream.
   * The details parameter is now strongly typed.
   * @param details The details for the new stream schedule.
   */
  const handleScheduleSubmit = async (details: { title: string; description: string; scheduledTime: string }) => { 
      await p.onScheduleStream(details); 
      setShowScheduleForm(false); 
  };
  
  const TabButton: React.FC<{ tab: SettingsTab; children: React.ReactNode }> = ({ tab, children }) => (
    <Pressable onPress={() => setActiveTab(tab)} className={`flex-1 flex-row justify-center items-center space-x-2 py-3 border-b-2 ${activeTab === tab ? 'border-purple-400' : 'border-transparent'}`}>
        {children}
    </Pressable>
  );
  
  const TextForTab: React.FC<{tab: SettingsTab; children: React.ReactNode}> = ({tab, children}) => (
      <Text className={`text-sm font-semibold ${activeTab === tab ? 'text-purple-400' : 'text-gray-400'}`}>{children}</Text>
  )

  const activeDestination = p.streamDestinations.find(d => d.id === p.activeStreamDestinationId);
  const isYouTubeSelected = activeDestination?.name === 'YouTube';

  if (!isOpen) return null;

  return (
    <Modal transparent={true} visible={isOpen} onRequestClose={onClose} animationType="slide">
        <View className="flex-1 bg-black/60 items-center justify-end">
            <Pressable className="bg-gray-800 rounded-t-2xl w-full max-w-lg border-t border-gray-700">
                <View className="px-6 pt-6 flex-row justify-between items-center">
                    <Text className="text-xl font-bold text-white">Settings</Text>
                    <Pressable onPress={onClose} className="p-1"><XIcon size={24} color="#9CA3AF"/></Pressable>
                </View>
                <View className="flex-row border-b border-gray-700 mx-6">
                    <TabButton tab="stream"><BroadcastIcon size={20} color={activeTab === 'stream' ? '#c084fc' : '#9ca3af'}/><TextForTab tab="stream">Live Stream</TextForTab></TabButton>
                    <TabButton tab="quality"><CameraIcon size={20} color={activeTab === 'quality' ? '#c084fc' : '#9ca3af'}/><TextForTab tab="quality">Quality</TextForTab></TabButton>
                </View>
                <ScrollView className="p-6 max-h-[65vh]">
                    {activeTab === 'stream' && (
                    <View className="space-y-4">
                        {destinationMode !== 'view' ? <DestinationEditor mode={destinationMode} destination={editingDestination} onSave={handleDestinationSave} onCancel={() => setDestinationMode('view')} /> :
                        showScheduleForm ? <ScheduleStreamForm onSchedule={handleScheduleSubmit} onCancel={() => setShowScheduleForm(false)} /> :
                        (
                        <>
                            <View>
                                <Text className="text-sm font-medium text-gray-300 mb-1">Stream Destination</Text>
                                <View className="flex-row items-center space-x-2">
                                    <View className="flex-1">
                                        <Pressable onPress={() => setIsDestinationPickerOpen(!isDestinationPickerOpen)} className="bg-gray-700 rounded-lg px-3 py-2.5 flex-row justify-between items-center">
                                            <Text className="text-white text-sm">{activeDestination?.name || 'None'}</Text>
                                            <ChevronDownIcon size={20} color="white" />
                                        </Pressable>
                                        {isDestinationPickerOpen && (
                                            <View className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg z-10 max-h-48 overflow-hidden">
                                                <FlatList
                                                    data={p.streamDestinations}
                                                    keyExtractor={(item) => item.id.toString()}
                                                    renderItem={({ item }) => (
                                                        <Pressable
                                                            onPress={() => { p.setActiveStreamDestinationId(item.id); setIsDestinationPickerOpen(false); }}
                                                            className="px-3 py-2.5 flex-row items-center justify-between"
                                                        >
                                                            <Text className="text-white text-sm">{item.name}</Text>
                                                            {item.id === p.activeStreamDestinationId && <CheckIcon size={16} color="#a855f7" />}
                                                        </Pressable>
                                                    )}
                                                />
                                            </View>
                                        )}
                                    </View>
                                    {!isYouTubeSelected && activeDestination && <>
                                    <Pressable onPress={() => { setEditingDestination({name: '', url: '', key: ''}); setDestinationMode('add');}} className="p-2 bg-purple-600 rounded-lg"><PlusIcon size={20} color="white"/></Pressable>
                                    <Pressable onPress={() => { if(activeDestination) { setEditingDestination(activeDestination); setDestinationMode('edit'); }}} disabled={!activeDestination} className="p-2 bg-gray-600 rounded-lg disabled:opacity-50"><PencilIcon size={20} color="white"/></Pressable>
                                    <Pressable onPress={handleDeleteClick} disabled={!activeDestination || p.streamDestinations.length <= 1} className="p-2 bg-red-700 rounded-lg disabled:opacity-50"><TrashIcon size={20} color="white"/></Pressable>
                                    </>}
                                </View>
                            </View>
                            {activeDestination && !isYouTubeSelected && (
                                <View className="space-y-3 bg-gray-900/50 p-3 rounded-lg">
                                    <View><Text className="text-xs font-medium text-gray-400">URL</Text><Text className="text-sm text-white">{activeDestination.url || 'Not set'}</Text></View>
                                    <View><Text className="text-xs font-medium text-gray-400">Key</Text><View className="flex-row items-center space-x-2"><Text className="flex-1 text-sm text-white">{isKeyVisible ? activeDestination.key || 'Not set' : '•••••••••'}</Text><Pressable onPress={() => setIsKeyVisible(!isKeyVisible)} className="p-2">{isKeyVisible ? <EyeOffIcon size={20} color="#9ca3af"/> : <EyeIcon size={20} color="#9ca3af"/>}</Pressable></View></View>
                                </View>
                            )}
                            {isYouTubeSelected && (
                                <View className="space-y-4 bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                                <Text className="font-semibold text-lg text-white">YouTube Integration</Text>
                                { !p.isAuthed ? <Pressable onPress={p.onSignIn} className="w-full bg-red-600 items-center py-2 px-4 rounded-lg"><Text className="text-white font-bold">Connect to YouTube</Text></Pressable> :
                                    (
                                    <View className="space-y-4">
                                        <View className="flex-row items-center justify-between"><View className="flex-row items-center space-x-2">{p.userInfo?.photo && <Image source={{uri:p.userInfo.photo}} className="w-8 h-8 rounded-full" />}<Text className="text-sm text-white">{p.userInfo?.name}</Text></View><Pressable onPress={p.onSignOut}><Text className="text-xs text-red-400">Disconnect</Text></Pressable></View>
                                        <View>
                                            <Text className="text-sm font-medium text-gray-300 mb-1">Active Broadcast</Text>
                                            <View className="flex-row items-center space-x-2">
                                                <View className="flex-1 bg-gray-700 rounded-lg px-3 py-2.5">
                                                    <Text className="text-white text-sm" numberOfLines={1}>{p.activeYoutubeBroadcast ? `[${p.activeYoutubeBroadcast.status.lifeCycleStatus.toUpperCase()}] ${p.activeYoutubeBroadcast.snippet.title}` : 'None Selected'}</Text>
                                                </View>
                                                <Pressable onPress={() => setShowScheduleForm(true)} className="p-2.5 bg-blue-600 rounded-lg"><CalendarPlusIcon size={20} color="white"/></Pressable>
                                            </View>
                                        </View>
                                    </View>
                                    )
                                }
                                </View>
                            )}
                        </>
                        )}
                    </View>
                    )}
                    {activeTab === 'quality' && (
                    <View className="space-y-4">
                        <View><Text className="block text-sm font-medium text-gray-300 mb-2">Stream Quality</Text></View>
                        <View className="bg-gray-900/50 p-3 rounded-lg space-y-3"><View className="flex-row items-center"><Switch value={p.recordLocally} onValueChange={p.setRecordLocally} /><Text className="ml-3 text-sm font-medium text-gray-200">Record video to device</Text></View>{p.recordLocally && (<View><Text className="text-sm font-medium text-gray-300 mb-2">Record Quality</Text></View>)}</View>
                        <View className="flex-row gap-4"><View className="flex-1"><Text className="text-sm font-medium text-gray-300 mb-2">Frame Rate (FPS)</Text><View className="flex-row w-full bg-gray-900/50 rounded-lg p-1"><Pressable onPress={() => p.setFps(30)} className={`flex-1 py-1.5 items-center rounded-md ${p.fps === 30 ? 'bg-purple-600' : ''}`}><Text className="text-xs font-semibold text-white">30</Text></Pressable><Pressable onPress={() => p.setFps(60)} className={`flex-1 py-1.5 items-center rounded-md ${p.fps === 60 ? 'bg-purple-600' : ''}`}><Text className="text-xs font-semibold text-white">60</Text></Pressable></View></View><View className="flex-1"><Text className="text-sm font-medium text-gray-300 mb-2">Bitrate</Text><View className="flex-row w-full bg-gray-900/50 rounded-lg p-1"><Pressable onPress={() => p.setBitrateQuality('standard')} className={`flex-1 py-1.5 items-center rounded-md ${p.bitrateQuality === 'standard' ? 'bg-purple-600' : ''}`}><Text className="text-xs font-semibold text-white">Standard</Text></Pressable><Pressable onPress={() => p.setBitrateQuality('high')} className={`flex-1 py-1.5 items-center rounded-md ${p.bitrateQuality === 'high' ? 'bg-purple-600' : ''}`}><Text className="text-xs font-semibold text-white">High</Text></Pressable></View></View></View>
                        <View><Text className="text-sm font-medium text-gray-300 mb-2">Orientation Lock</Text><View className="flex-row w-full bg-gray-900/50 rounded-lg p-1"><Pressable onPress={() => p.setOrientationLock('UNLOCKED')} className={`flex-1 py-1.5 items-center rounded-md ${p.orientationLock === 'UNLOCKED' ? 'bg-purple-600' : ''}`}><Text className="text-sm font-semibold text-white">Unlocked</Text></Pressable><Pressable onPress={() => p.setOrientationLock('LANDSCAPE')} className={`flex-1 py-1.5 items-center rounded-md ${p.orientationLock === 'LANDSCAPE' ? 'bg-purple-600' : ''}`}><Text className="text-sm font-semibold text-white">Landscape</Text></Pressable><Pressable onPress={() => p.setOrientationLock('PORTRAIT')} className={`flex-1 py-1.5 items-center rounded-md ${p.orientationLock === 'PORTRAIT' ? 'bg-purple-600' : ''}`}><Text className="text-sm font-semibold text-white">Portrait</Text></Pressable></View><Text className="text-xs text-gray-400 mt-2">Changing quality settings will restart the camera if it's on.</Text></View>
                    </View>
                    )}
                    <View className="mt-6 border-t border-gray-700 pt-4"><View className="flex-row items-center"><Switch value={p.rememberSettings} onValueChange={p.setRememberSettings}/><Text className="ml-2 text-sm text-gray-300">Remember all settings</Text></View></View>
                </ScrollView>
                <View className="bg-gray-900/50 px-6 py-4 rounded-b-2xl flex-row justify-between items-center">
                    <Pressable onPress={p.onShowLogViewer}><Text className="text-xs text-gray-500">Version: {APP_VERSION}</Text></Pressable>
                    <Pressable onPress={onClose} className="px-4 py-2 bg-gray-700 rounded-lg"><Text className="font-medium text-gray-300">Close</Text></Pressable>
                </View>
            </Pressable>
        </View>
    </Modal>
  );
};
