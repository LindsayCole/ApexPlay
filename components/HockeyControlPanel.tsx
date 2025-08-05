import React, { useState, Dispatch, SetStateAction, useEffect } from 'react';
import { View, Text, Pressable, TextInput, Image, Modal, ScrollView, Switch, Alert, useWindowDimensions } from 'react-native';
import Slider from '@react-native-community/slider';
import DeviceInfo from 'react-native-device-info';
import type { Team, BitrateDataPoint } from '../App';
import type { ScoreboardSettings, Banner } from './Scoreboard';
import { XIcon, PlusIcon, MinusIcon, PlayIcon, StopIcon, ReplayIcon, UploadIcon, TrashIcon, SettingsIcon, MicrophoneIcon, MicrophoneOffIcon, SaveIcon, BookmarkSquareIcon, CheckIcon, ChartBarIcon, HockeyPuckIcon, PencilIcon, EyeIcon } from './Icons';
import { logger } from '../services/loggingService';
import { TimeSelector } from './TimeSelector';
import { addTeamPreset } from '../services/dbService';
import { LineChart } from './LineChart';

interface HockeyControlPanelProps {
    isOpen: boolean;
    onClose: () => void;
    team1: Team;
    setTeam1: (team: Team | ((prevTeam: Team) => Team)) => void;
    team2: Team;
    setTeam2: (team: Team | ((prevTeam: Team) => Team)) => void;
    period: number;
    setPeriod: (period: number | ((prevPeriod: number) => number)) => void;
    gameClock: number;
    setGameClock: (time: number) => void;
    isClockRunning: boolean;
    setIsClockRunning: (isRunning: boolean) => void;
    scoreboardSettings: ScoreboardSettings;
    setScoreboardSettings: Dispatch<SetStateAction<ScoreboardSettings>>;
    gameTitleBanner: Banner;
    setGameTitleBanner: Dispatch<SetStateAction<Banner>>;
    banner1: Banner;
    setBanner1: Dispatch<SetStateAction<Banner>>;
    banner2: Banner;
    setBanner2: Dispatch<SetStateAction<Banner>>;
    periodLengthMinutes: number;
    setPeriodLengthMinutes: Dispatch<SetStateAction<number>>;
    periodLengthSeconds: number;
    setPeriodLengthSeconds: Dispatch<SetStateAction<number>>;
    penaltyLengthMinutes: number;
    setPenaltyLengthMinutes: Dispatch<SetStateAction<number>>;
    penaltyLengthSeconds: number;
    setPenaltyLengthSeconds: Dispatch<SetStateAction<number>>;
    onOpenLogoLibrary: (target: 'team1' | 'team2') => void;
    onOpenTeamLibrary: (target: 'team1' | 'team2') => void;
    controlPanelOpacity: number;
    setControlPanelOpacity: (opacity: number) => void;
    isPanelFrosted: boolean;
    setIsPanelFrosted: Dispatch<SetStateAction<boolean>>;
    powerPlayStatus: 'none' | 'pp' | 'pk';
    setPowerPlayStatus: Dispatch<SetStateAction<'none' | 'pp' | 'pk'>>;
    penaltyClock: number;
    setPenaltyClock: Dispatch<SetStateAction<number>>;
    isPenaltyClockRunning: boolean;
    setIsPenaltyClockRunning: (isRunning: boolean) => void;
    isMuted: boolean;
    onToggleMute: () => void;
    isStreaming: boolean;
    zoomLevel: number;
    setZoomLevel: (level: number) => void;
    zoomCapabilities: { min: number; max: number; step: number; } | null;
    bitrateHistory: BitrateDataPoint[];
    renderingFps: number;
    isRecordingLocally: boolean;
}

type ControlPanelTab = 'game' | 'teams' | 'banners' | 'style' | 'performance' | 'preferences';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <Pressable
        onPress={onClick}
        className={`px-3 py-2 rounded-lg flex-row items-center space-x-2 ${
            active ? 'bg-purple-600' : 'bg-white/10'
        }`}
    >
        {children}
    </Pressable>
);

const ScoreControl: React.FC<{ team: Team; onScoreChange: (newScore: number) => void; label: string }> = ({ team, onScoreChange, label }) => (
    <View className="items-center space-y-2 flex-1">
        <Text className="text-sm font-semibold text-white truncate max-w-[120px]">{label}</Text>
        <View className="flex-row items-center space-x-3 bg-black/20 p-2 rounded-lg">
            <Pressable onPress={() => onScoreChange(Math.max(0, team.score - 1))} className="p-2 bg-white/10 rounded-full"><MinusIcon size={20} color="white" /></Pressable>
            <Text className="text-2xl font-bold w-12 text-center text-white">{team.score}</Text>
            <Pressable onPress={() => onScoreChange(team.score + 1)} className="p-2 bg-white/10 rounded-full"><PlusIcon size={20} color="white" /></Pressable>
        </View>
    </View>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <View className="space-y-3 bg-gray-800/50 p-3 rounded-lg">
        <Text className="text-base font-bold text-white">{title}</Text>
        {children}
    </View>
);

const GameTab: React.FC<Pick<HockeyControlPanelProps, 'team1' | 'setTeam1' | 'team2' | 'setTeam2' | 'period' | 'setPeriod' | 'gameClock' | 'setGameClock' | 'isClockRunning' | 'setIsClockRunning' | 'periodLengthMinutes' | 'periodLengthSeconds' | 'penaltyClock' | 'setPenaltyClock' | 'penaltyLengthMinutes' | 'penaltyLengthSeconds' | 'setIsPenaltyClockRunning' | 'powerPlayStatus' | 'setPowerPlayStatus' | 'onToggleMute' | 'isMuted' | 'isStreaming'>> = ({ team1, setTeam1, team2, setTeam2, period, setPeriod, gameClock, setGameClock, isClockRunning, setIsClockRunning, periodLengthMinutes, periodLengthSeconds, setPenaltyClock, penaltyLengthMinutes, penaltyLengthSeconds, setIsPenaltyClockRunning, setPowerPlayStatus, onToggleMute, isMuted, isStreaming }) => {
    
    const resetClock = () => {
        setIsClockRunning(false);
        setGameClock(periodLengthMinutes * 60 + periodLengthSeconds);
    };

    const startPenalty = (team: 'team1' | 'team2') => {
        setPenaltyClock(penaltyLengthMinutes * 60 + penaltyLengthSeconds);
        setPowerPlayStatus(team === 'team1' ? 'pk' : 'pp');
        setIsPenaltyClockRunning(true);
    };

    const clearPenalty = () => {
        setPenaltyClock(0);
        setIsPenaltyClockRunning(false);
        setPowerPlayStatus('none');
    };

    return (
        <View className="space-y-4">
            <Section title="Score">
                <View className="flex-row justify-around">
                    <ScoreControl team={team1} onScoreChange={(s) => setTeam1(t => ({...t, score: s}))} label={team1.name} />
                    <ScoreControl team={team2} onScoreChange={(s) => setTeam2(t => ({...t, score: s}))} label={team2.name} />
                </View>
            </Section>

            <Section title="Game State">
                <View className="flex-row items-center justify-around">
                    <View className="items-center">
                        <Text className="text-sm font-semibold text-white mb-2">Period</Text>
                        <View className="flex-row items-center space-x-3 bg-black/20 p-2 rounded-lg">
                            <Pressable onPress={() => setPeriod(p => Math.max(1, p - 1))} className="p-2 bg-white/10 rounded-full"><MinusIcon size={20} color="white" /></Pressable>
                            <Text className="text-2xl font-bold w-12 text-center text-white">{period}</Text>
                            <Pressable onPress={() => setPeriod(p => p + 1)} className="p-2 bg-white/10 rounded-full"><PlusIcon size={20} color="white" /></Pressable>
                        </View>
                    </View>
                    <View className="items-center">
                         <Text className="text-sm font-semibold text-white mb-2">Game Clock</Text>
                        <View className="flex-row items-center space-x-3">
                             <Pressable onPress={() => setIsClockRunning(!isClockRunning)} className={`p-3 rounded-full ${isClockRunning ? 'bg-red-600' : 'bg-green-600'}`}>
                                {isClockRunning ? <StopIcon size={28} color="white" /> : <PlayIcon size={28} color="white" />}
                            </Pressable>
                            <Pressable onPress={resetClock} className="p-3 rounded-full bg-gray-600"><ReplayIcon size={28} color="white" /></Pressable>
                        </View>
                    </View>
                </View>
            </Section>

            <Section title="Penalty">
                <View className="flex-row items-center justify-around">
                    <Pressable onPress={() => startPenalty('team1')} className="px-4 py-2 bg-yellow-500 rounded-lg"><Text className="font-semibold text-black">{team1.name} Penalty</Text></Pressable>
                    <Pressable onPress={clearPenalty} className="p-2 bg-red-700 rounded-full"><TrashIcon size={20} color="white" /></Pressable>
                    <Pressable onPress={() => startPenalty('team2')} className="px-4 py-2 bg-yellow-500 rounded-lg"><Text className="font-semibold text-black">{team2.name} Penalty</Text></Pressable>
                </View>
            </Section>
             <Section title="Audio">
                <Pressable onPress={onToggleMute} disabled={!isStreaming} className="w-full flex-row items-center justify-center space-x-3 py-3 bg-black/20 rounded-lg disabled:opacity-50">
                    {isMuted ? <MicrophoneOffIcon size={24} color="#FBBF24" /> : <MicrophoneIcon size={24} color="white" />}
                    <Text className="text-lg font-semibold text-white">{isMuted ? 'Microphone is Muted' : 'Microphone is Live'}</Text>
                </Pressable>
            </Section>
        </View>
    );
};
const TeamEditor: React.FC<{team: Team; setTeam: (fn: (prev: Team) => Team) => void; onOpenLogoLibrary: () => void; onOpenTeamLibrary: () => void; teamLabel: string;}> = ({ team, setTeam, onOpenLogoLibrary, onOpenTeamLibrary, teamLabel }) => {
    const handleSavePreset = () => {
        Alert.alert('Save Team Preset', `Save "${team.name}" to the library?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Save', onPress: async () => {
                try {
                    await addTeamPreset({ name: team.name, logo: team.logo, color: team.color });
                    logger.info(`Saved team preset: ${team.name}`);
                    Alert.alert('Success', `"${team.name}" has been saved to your library.`);
                } catch(e) {
                    logger.error('Failed to save team preset', e);
                    Alert.alert('Error', 'Could not save the team preset.');
                }
            }},
        ]);
    };

    /**
     * Validates and updates the team color in state.
     * Allows only valid hex characters ('#', 0-9, A-F) and limits length.
     * @param color The input string from the TextInput.
     */
    const handleColorChange = (color: string) => {
        const validHexPattern = /^#?[0-9a-fA-F]*$/;
        if (validHexPattern.test(color) && color.length <= 7) {
            setTeam(t => ({...t, color}));
        }
    };

    return (
        <Section title={teamLabel}>
            <View className="flex-row items-center space-x-2">
                <View className="w-16 h-16 bg-black/20 rounded-lg items-center justify-center p-1">
                    {team.logo ? <Image source={{uri: team.logo}} className="w-full h-full" resizeMode="contain" /> : <HockeyPuckIcon size={32} color="#6b7280" />}
                </View>
                <View className="flex-1 space-y-2">
                    <TextInput value={team.name} onChangeText={(name) => setTeam(t => ({...t, name}))} className="bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg px-3 py-2 text-sm" placeholder="Team Name" />
                    <View className="flex-row items-center space-x-2">
                         <View style={{ backgroundColor: team.color }} className="w-8 h-8 rounded-full border-2 border-white/20" />
                        <TextInput value={team.color} onChangeText={handleColorChange} className="flex-1 bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg px-3 py-2 text-sm" placeholder="#FFFFFF" />
                    </View>
                </View>
            </View>
            <View className="flex-row justify-between pt-2">
                <Pressable onPress={onOpenLogoLibrary} className="px-3 py-2 bg-purple-600 rounded-lg flex-row items-center space-x-2"><UploadIcon size={16} color="white"/><Text className="text-white text-xs font-semibold">Logo</Text></Pressable>
                <Pressable onPress={onOpenTeamLibrary} className="px-3 py-2 bg-blue-600 rounded-lg flex-row items-center space-x-2"><BookmarkSquareIcon size={16} color="white"/><Text className="text-white text-xs font-semibold">Load</Text></Pressable>
                <Pressable onPress={handleSavePreset} className="px-3 py-2 bg-green-600 rounded-lg flex-row items-center space-x-2"><SaveIcon size={16} color="white"/><Text className="text-white text-xs font-semibold">Save</Text></Pressable>
            </View>
        </Section>
    )
}

const TeamsTab: React.FC<Pick<HockeyControlPanelProps, 'team1' | 'setTeam1' | 'team2' | 'setTeam2' | 'onOpenLogoLibrary' | 'onOpenTeamLibrary'>> = (props) => {
    return (
        <View className="space-y-4">
            <TeamEditor team={props.team1} setTeam={props.setTeam1} onOpenLogoLibrary={() => props.onOpenLogoLibrary('team1')} onOpenTeamLibrary={() => props.onOpenTeamLibrary('team1')} teamLabel="Team 1 (Home)" />
            <TeamEditor team={props.team2} setTeam={props.setTeam2} onOpenLogoLibrary={() => props.onOpenLogoLibrary('team2')} onOpenTeamLibrary={() => props.onOpenTeamLibrary('team2')} teamLabel="Team 2 (Away)" />
        </View>
    );
};

const BannerEditor: React.FC<{banner: Banner; setBanner: Dispatch<SetStateAction<Banner>>; label: string}> = ({ banner, setBanner, label }) => (
    <Section title={label}>
        <TextInput
            value={banner.text}
            onChangeText={(text) => setBanner(b => ({...b, text}))}
            placeholder="Banner text..."
            className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg px-3 py-2 text-sm"
        />
        <View className="flex-row justify-around items-center pt-2">
            <View className="flex-row items-center space-x-2">
                <Switch value={banner.isVisible} onValueChange={(v) => setBanner(b => ({...b, isVisible: v}))} />
                <Text className="text-white text-sm">Visible</Text>
            </View>
            <View className="flex-row items-center space-x-2">
                <Switch value={banner.isBold} onValueChange={(v) => setBanner(b => ({...b, isBold: v}))} />
                <Text className="text-white text-sm">Bold</Text>
            </View>
            <View className="flex-row items-center space-x-2">
                <Switch value={banner.isRed} onValueChange={(v) => setBanner(b => ({...b, isRed: v}))} />
                <Text className="text-white text-sm">Red</Text>
            </View>
        </View>
    </Section>
);

const BannersTab: React.FC<Pick<HockeyControlPanelProps, 'gameTitleBanner' | 'setGameTitleBanner' | 'banner1' | 'setBanner1' | 'banner2' | 'setBanner2'>> = (props) => {
    return (
        <View className="space-y-4">
            <BannerEditor banner={props.gameTitleBanner} setBanner={props.setGameTitleBanner} label="Game Title Banner" />
            <BannerEditor banner={props.banner1} setBanner={props.setBanner1} label="Info Banner 1" />
            <BannerEditor banner={props.banner2} setBanner={props.setBanner2} label="Info Banner 2" />
        </View>
    );
};

const StyleTab: React.FC<Pick<HockeyControlPanelProps, 'scoreboardSettings' | 'setScoreboardSettings' | 'controlPanelOpacity' | 'setControlPanelOpacity' | 'isPanelFrosted' | 'setIsPanelFrosted' | 'isStreaming' | 'zoomCapabilities' | 'zoomLevel' | 'setZoomLevel'>> = (props) => {
    const { scoreboardSettings, setScoreboardSettings, controlPanelOpacity, setControlPanelOpacity, isPanelFrosted, setIsPanelFrosted, isStreaming, zoomCapabilities, zoomLevel, setZoomLevel } = props;
    
    return (
        <View className="space-y-4">
            {isStreaming && zoomCapabilities && (
                 <Section title="Camera Zoom">
                     <Slider
                        minimumValue={zoomCapabilities.min}
                        maximumValue={zoomCapabilities.max}
                        step={zoomCapabilities.step}
                        value={zoomLevel}
                        onValueChange={setZoomLevel}
                        thumbTintColor="#a855f7"
                        minimumTrackTintColor="#a855f7"
                        maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                    />
                </Section>
            )}
            <Section title="Scoreboard Style">
                <View className="space-y-3">
                    <Text className="text-sm font-medium text-white">Scale: {scoreboardSettings.scale.toFixed(2)}x</Text>
                    <Slider value={scoreboardSettings.scale} onValueChange={(v) => setScoreboardSettings(s => ({...s, scale: v}))} minimumValue={0.5} maximumValue={2.0} step={0.05} thumbTintColor="#a855f7" />
                    
                    <Text className="text-sm font-medium text-white">Background Color & Opacity</Text>
                     <TextInput value={scoreboardSettings.style.backgroundColor} onChangeText={(c) => setScoreboardSettings(s => ({...s, style: {...s.style, backgroundColor: c}}))} className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg px-3 py-2 text-sm" placeholder="rgba(0,0,0,0.7)" />
                </View>
            </Section>
            <Section title="Panel Style">
                 <Text className="text-sm font-medium text-white">Control Panel Opacity: {controlPanelOpacity.toFixed(2)}</Text>
                 <Slider value={controlPanelOpacity} onValueChange={setControlPanelOpacity} minimumValue={0.5} maximumValue={1.0} step={0.05} thumbTintColor="#a855f7" />
                <View className="flex-row items-center space-x-2 pt-2">
                    <Switch value={isPanelFrosted} onValueChange={setIsPanelFrosted} />
                    <Text className="text-white text-sm">Use Frosted Glass Effect (if supported)</Text>
                </View>
            </Section>
        </View>
    );
};

const PerformanceMonitor: React.FC<{bitrateHistory: BitrateDataPoint[], renderingFps: number, isOpen: boolean, activeTab: ControlPanelTab}> = ({bitrateHistory, renderingFps, isOpen, activeTab}) => {
    const { width } = useWindowDimensions();
    const chartWidth = width - 80;

    const [jsHeapUsage, setJsHeapUsage] = useState<{ used: number, total: number } | null>(null);
    const [storageUsage, setStorageUsage] = useState<{ used: number, quota: number } | null>(null);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | undefined;
        if (isOpen && activeTab === 'performance') {
            const updateMetrics = async () => {
                try {
                    // Memory & Storage
                    const usedMemory = await DeviceInfo.getUsedMemory();
                    const totalMemory = await DeviceInfo.getTotalMemory();
                    setJsHeapUsage({ used: usedMemory, total: totalMemory });

                    const freeDisk = await DeviceInfo.getFreeDiskStorage();
                    const totalDisk = await DeviceInfo.getTotalDiskCapacity();
                    setStorageUsage({ used: totalDisk - freeDisk, quota: totalDisk });

                } catch (e) {
                    logger.warn('Could not update performance metrics', e);
                }
            };

            updateMetrics();
            interval = setInterval(updateMetrics, 10000); // Update every 10 seconds
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isOpen, activeTab]);


    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <View className="space-y-4">
             <Section title="Live Metrics">
                <View className="flex-row justify-around">
                    <View className="items-center"><Text className="text-xs text-gray-400">FPS</Text><Text className="text-lg font-bold text-white">{renderingFps}</Text></View>
                    <View className="items-center"><Text className="text-xs text-gray-400">JS Heap</Text><Text className="text-lg font-bold text-white">{jsHeapUsage ? `${formatBytes(jsHeapUsage.used)}` : 'N/A'}</Text></View>
                    <View className="items-center"><Text className="text-xs text-gray-400">Storage</Text><Text className="text-lg font-bold text-white">{storageUsage ? `${formatBytes(storageUsage.used)}` : 'N/A'}</Text></View>
                </View>
            </Section>
            <Section title="Bitrate (Last 5 mins)">
                <LineChart data={bitrateHistory} width={chartWidth} height={150} />
                <Text className="text-xs text-gray-400 text-center pt-1">Bitrate history requires stream to be live. Unit: kbps.</Text>
            </Section>
        </View>
    )
};

const PreferencesTab: React.FC<Pick<HockeyControlPanelProps, 'periodLengthMinutes' | 'setPeriodLengthMinutes' | 'periodLengthSeconds' | 'setPeriodLengthSeconds' | 'penaltyLengthMinutes' | 'setPenaltyLengthMinutes' | 'penaltyLengthSeconds' | 'setPenaltyLengthSeconds'>> = (props) => {
    return (
        <View className="space-y-4">
            <Section title="Default Period Length">
                <View className="flex-row justify-around">
                    <TimeSelector label="Minutes" value={props.periodLengthMinutes} setValue={props.setPeriodLengthMinutes} max={60} />
                    <TimeSelector label="Seconds" value={props.periodLengthSeconds} setValue={props.setPeriodLengthSeconds} max={59} />
                </View>
            </Section>
            <Section title="Default Penalty Length">
                 <View className="flex-row justify-around">
                    <TimeSelector label="Minutes" value={props.penaltyLengthMinutes} setValue={props.setPenaltyLengthMinutes} max={10} />
                    <TimeSelector label="Seconds" value={props.penaltyLengthSeconds} setValue={props.setPenaltyLengthSeconds} max={59} />
                </View>
            </Section>
        </View>
    );
};

export const HockeyControlPanel: React.FC<HockeyControlPanelProps> = (props) => {
    const { isOpen, onClose, controlPanelOpacity, isPanelFrosted } = props;
    const [activeTab, setActiveTab] = useState<ControlPanelTab>('game');

    const renderActiveTab = () => {
        switch(activeTab) {
            case 'game': return <GameTab {...props} />;
            case 'teams': return <TeamsTab {...props} />;
            case 'banners': return <BannersTab {...props} />;
            case 'style': return <StyleTab {...props} />;
            case 'performance': return <PerformanceMonitor bitrateHistory={props.bitrateHistory} renderingFps={props.renderingFps} isOpen={isOpen} activeTab={activeTab} />;
            case 'preferences': return <PreferencesTab {...props} />;
            default: return null;
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isOpen}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end">
                 <Pressable className="flex-1 bg-black/30" onPress={onClose} />
                <View
                    className={`bg-gray-900 text-white rounded-t-2xl shadow-2xl p-4 border-t border-white/10 ${isPanelFrosted ? 'bg-opacity-80' : 'bg-opacity-100'}`}
                    style={{ opacity: controlPanelOpacity }}
                >
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-bold text-white">Game Controls</Text>
                        <Pressable onPress={onClose} className="p-1 rounded-full bg-white/10"><XIcon size={20} color="white"/></Pressable>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row space-x-2 mb-4">
                        <TabButton active={activeTab === 'game'} onClick={() => setActiveTab('game')}><HockeyPuckIcon size={16} color="white" /><Text className="text-white text-sm">Game</Text></TabButton>
                        <TabButton active={activeTab === 'teams'} onClick={() => setActiveTab('teams')}><EyeIcon size={16} color="white"/><Text className="text-white text-sm">Teams</Text></TabButton>
                        <TabButton active={activeTab === 'banners'} onClick={() => setActiveTab('banners')}><PencilIcon size={16} color="white" /><Text className="text-white text-sm">Banners</Text></TabButton>
                        <TabButton active={activeTab === 'style'} onClick={() => setActiveTab('style')}><CheckIcon size={16} color="white" /><Text className="text-white text-sm">Style</Text></TabButton>
                        <TabButton active={activeTab === 'performance'} onClick={() => setActiveTab('performance')}><ChartBarIcon size={16} color="white" /><Text className="text-white text-sm">Perf.</Text></TabButton>
                        <TabButton active={activeTab === 'preferences'} onClick={() => setActiveTab('preferences')}><SettingsIcon size={16} color="white"/><Text className="text-white text-sm">Prefs</Text></TabButton>
                    </ScrollView>

                    <ScrollView className="max-h-[50vh]">
                        {renderActiveTab()}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};