/**
 * @file App.tsx
 * @version 2.0.1
 * @author WeirdGoalieDad / Lindsay Cole
 * @dedication For Caden and Ryker.
 * @description The main component for the Apex Play native application. Manages all state and logic for streaming, game controls, and UI within a React Native environment.
 */
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { SafeAreaView, View, Text, StyleSheet, StatusBar, Pressable } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RealmProvider } from '@realm/react';
import { BSON } from 'realm';
import {
  useCameraDevice,
} from 'react-native-vision-camera';
import { NodeCameraView } from 'react-native-nodemediaclient';
import Orientation from 'react-native-orientation-locker';
import KeepAwake from 'react-native-keep-awake';
import DeviceInfo from 'react-native-device-info';

import { ControlBar } from './components/ControlBar';
import { SettingsModal } from './components/SettingsModal';
import { LiveIndicator } from './components/LiveIndicator';
import { ConnectionIndicator } from './components/ConnectionIndicator';
import { Scoreboard, ScoreboardSettings, Banner } from './components/Scoreboard';
import { HockeyControlPanel } from './components/HockeyControlPanel';
import { LogoLibraryModal } from './components/LogoLibraryModal';
import { TeamLibraryModal } from './components/TeamLibraryModal';
import { LogViewerModal } from './components/LogViewerModal';
import { CameraIcon, AlertTriangleIcon, MicrophoneOffIcon, XIcon } from './components/Icons';
import { logger } from './services/loggingService';
import { allDbModels, getStreamDestinations, addStreamDestination, updateStreamDestination, deleteStreamDestination, StreamDestinationPlain, StreamDestinationData } from './services/dbService';
import { BatteryIndicator } from './components/BatteryIndicator';
import { ZoomSlider } from './components/ZoomSlider';
import { PermissionsGate } from './components/PermissionsGate';
import * as YoutubeService from './services/youtubeService';
import { LoadingScreen } from './components/LoadingScreen';
import { usePermissions } from './hooks/usePermissions';

/**
 * Represents a team in the game.
 * The `_id` is an optional RealmDB-specific identifier.
 */
export interface Team {
  _id?: BSON.ObjectId;
  name: string;
  score: number;
  logo: string | null;
  color: string;
}

interface BatteryStatus {
  level: number;
  charging: boolean;
  isSupported: boolean;
}

export interface BitrateDataPoint {
    timestamp: number;
    value: number;
}

export type OrientationLockType = 'UNLOCKED' | 'LANDSCAPE' | 'PORTRAIT';
export type BitrateQuality = 'standard' | 'high';

export const VIDEO_QUALITIES = {
  "480p": { label: "480p (SD)", width: 854, height: 480, bitrate: 1_000_000 },
  "720p": { label: "720p (HD)", width: 1280, height: 720, bitrate: 2_500_000 },
  "1080p": { label: "1080p (Full HD)", width: 1920, height: 1080, bitrate: 4_500_000 },
};
export type QualityKey = keyof typeof VIDEO_QUALITIES;

const App: React.FC = () => {
  const [isAppReady, setIsAppReady] = useState(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [cameraFacingMode, setCameraFacingMode] = useState<'front' | 'back'>('back');
  const [streamQuality, setStreamQuality] = useState<QualityKey>('720p');
  const [recordQuality, setRecordQuality] = useState<QualityKey>('1080p');
  const [fps, setFps] = useState<number>(30);
  const [bitrateQuality, setBitrateQuality] = useState<BitrateQuality>('standard');
  const [orientationLock, setOrientationLock] = useState<OrientationLockType>('LANDSCAPE');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [error, setError] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'closed' | 'failed'>('closed');
  const [batteryStatus, setBatteryStatus] = useState<BatteryStatus>({ level: 1, charging: false, isSupported: true });
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showLogViewer, setShowLogViewer] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [isLogoLibraryOpen, setIsLogoLibraryOpen] = useState(false);
  const [isTeamLibraryOpen, setIsTeamLibraryOpen] = useState(false);
  const [teamTarget, setTeamTarget] = useState<'team1' | 'team2' | null>(null);
  const [showMuteOverlay, setShowMuteOverlay] = useState<boolean>(false);
  const [streamDestinations, setStreamDestinations] = useState<StreamDestinationPlain[]>([]);
  const [activeStreamDestinationId, setActiveStreamDestinationId] = useState<number | null>(null);
  const [recordLocally, setRecordLocally] = useState<boolean>(false);
  const [rememberSettings, setRememberSettings] = useState<boolean>(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const [userInfo, setUserInfo] = useState<YoutubeService.UserInfo | null>(null);
  const [youtubeBroadcasts, setYoutubeBroadcasts] = useState<YoutubeService.LiveBroadcast[]>([]);
  const [activeYoutubeBroadcast, setActiveYoutubeBroadcast] = useState<YoutubeService.LiveBroadcast | null>(null);

  const [team1, setTeam1] = useState<Team>({ name: 'HOME', score: 0, logo: null, color: '#FFFFFF' });
  const [team2, setTeam2] = useState<Team>({ name: 'AWAY', score: 0, logo: null, color: '#FFFFFF' });
  const [period, setPeriod] = useState<number>(1);
  const [periodLengthMinutes, setPeriodLengthMinutes] = useState<number>(20);
  const [periodLengthSeconds, setPeriodLengthSeconds] = useState<number>(0);
  const [penaltyLengthMinutes, setPenaltyLengthMinutes] = useState<number>(2);
  const [penaltyLengthSeconds, setPenaltyLengthSeconds] = useState<number>(0);
  const [gameClock, setGameClock] = useState<number>(periodLengthMinutes * 60);
  const [isClockRunning, setIsClockRunning] = useState<boolean>(false);
  const [penaltyClock, setPenaltyClock] = useState<number>(0);
  const [isPenaltyClockRunning, setIsPenaltyClockRunning] = useState<boolean>(false);
  const [powerPlayStatus, setPowerPlayStatus] = useState<'none' | 'pp' | 'pk'>('none');
  const [scoreboardSettings, setScoreboardSettings] = useState<ScoreboardSettings>({ position: { x: 50, y: 20 }, style: { backgroundColor: 'rgba(0, 0, 0, 0.7)' }, scale: 1.0 });
  const [gameTitleBanner, setGameTitleBanner] = useState<Banner>({ text: '', isVisible: false, isBold: true, isRed: false });
  const [banner1, setBanner1] = useState<Banner>({ text: '', isVisible: false, isBold: false, isRed: false });
  const [banner2, setBanner2] = useState<Banner>({ text: '', isVisible: false, isBold: false, isRed: false });
  const [controlPanelOpacity, setControlPanelOpacity] = useState<number>(0.8);
  const [isPanelFrosted, setIsPanelFrosted] = useState<boolean>(true);
  
  const [bitrateHistory, setBitrateHistory] = useState<BitrateDataPoint[]>([]);
  const [renderingFps, setRenderingFps] = useState<number>(0);


  const { permissions, requestPermissions, checkPermissions } = usePermissions();
  const device = useCameraDevice(cameraFacingMode);
  const streamRef = useRef<NodeCameraView>(null);
  const gameClockIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const zoomCapabilities = useMemo(() => {
    if (!device) return null;
    return { min: device.minZoom, max: device.maxZoom, step: 0.1 };
  }, [device]);

  // Effect to clamp the zoom level whenever the device or its capabilities change.
  useEffect(() => {
    if (zoomCapabilities) {
      const clampedZoom = Math.max(zoomCapabilities.min, Math.min(zoomLevel, zoomCapabilities.max));
      if (clampedZoom !== zoomLevel) {
        setZoomLevel(clampedZoom);
      }
    }
  }, [zoomCapabilities, zoomLevel]);

  const fetchYoutubeBroadcasts = useCallback(async () => {
    if (!isAuthed) return;
    try {
        const data = await YoutubeService.fetchBroadcasts();
        logger.info('Fetched YouTube broadcasts', {count: data.items.length});
        setYoutubeBroadcasts(data.items || []);
        if (data.items?.length > 0) {
          const readyStream = data.items.find((b) => b.status.lifeCycleStatus === 'ready');
          setActiveYoutubeBroadcast(readyStream || data.items[0]);
        }
    } catch (e: any) {
        logger.error('Could not fetch YouTube broadcasts', e);
        setError('Failed to fetch YouTube streams.');
    }
  }, [isAuthed]);

  const updateSigninStatus = useCallback((user: YoutubeService.UserInfo | null) => {
    if (user) {
      setIsAuthed(true);
      setUserInfo(user);
      logger.info('User is signed in to Google.');
      fetchYoutubeBroadcasts();
    } else {
      setIsAuthed(false);
      setUserInfo(null);
      setYoutubeBroadcasts([]);
      setActiveYoutubeBroadcast(null);
      logger.info('User is not signed in to Google.');
    }
  }, [fetchYoutubeBroadcasts]);

  useEffect(() => {
    const initializeApp = async () => {
      await logger.init();
      logger.info('App component mounted. Initializing...');
      Orientation.lockToLandscapeLeft();

      const initialPermissions = await checkPermissions();
      const needsToRequest = Object.values(initialPermissions).some(status => status === 'denied');
      if (needsToRequest) {
        logger.info('Permissions are in a denied state, requesting from user.');
        await requestPermissions();
      }
      
      await YoutubeService.configure();
      const signedInUser = await YoutubeService.getSignedInUser();
      if (signedInUser) {
        updateSigninStatus(signedInUser);
      }
      
      const destinations = await getStreamDestinations();
      if (destinations.length === 0) {
        logger.info("No stream destinations found. Populating with defaults.");
        await addStreamDestination({ name: 'YouTube', url: 'rtmp://a.rtmp.youtube.com/live2/', key: '' });
        await addStreamDestination({ name: 'Twitch', url: 'rtmps://ingest.twitch.tv/app/', key: '' });
        const newDests = await getStreamDestinations();
        setStreamDestinations(newDests);
        setActiveStreamDestinationId(newDests[0]?.id || null);
      } else {
        setStreamDestinations(destinations);
        setActiveStreamDestinationId(destinations[0]?.id || null);
      }
      
      setIsAppReady(true);
    };
    initializeApp();
  }, [updateSigninStatus, checkPermissions, requestPermissions]);

  const handleSignIn = useCallback(async () => {
    try {
      const user = await YoutubeService.signIn();
      updateSigninStatus(user);
    } catch (error) {
      logger.error('Google Sign-In failed', error);
      setError('Could not sign in to Google.');
    }
  }, [updateSigninStatus]);

  const handleSignOut = useCallback(async () => {
    try {
      await YoutubeService.signOut();
      updateSigninStatus(null);
    } catch (error) {
      logger.error('Google Sign-Out failed', error);
      setError('Could not sign out.');
    }
  }, [updateSigninStatus]);
  
  const handleScheduleStream = useCallback(async (details: { title: string; description: string; scheduledTime: string }) => {
    if (!isAuthed) return;
    try {
        await YoutubeService.scheduleBroadcast(details);
        logger.info("Successfully scheduled new stream. Re-fetching broadcasts.");
        await fetchYoutubeBroadcasts();
    } catch(e) {
        logger.error("Failed to schedule stream", e);
        setError("Could not schedule stream.");
    }
  }, [isAuthed, fetchYoutubeBroadcasts]);
  
  useEffect(() => {
    const updateBatteryMetric = async () => {
        try {
            const level = await DeviceInfo.getBatteryLevel();
            const charging = await DeviceInfo.isBatteryCharging();
            setBatteryStatus({ level, charging, isSupported: true });
        } catch (e) {
            logger.warn('Could not update battery metric', e);
            setBatteryStatus({ level: 1, charging: false, isSupported: false });
        }
    };

    updateBatteryMetric();
    const interval = setInterval(updateBatteryMetric, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    switch (orientationLock) {
      case 'LANDSCAPE':
        Orientation.lockToLandscape();
        break;
      case 'PORTRAIT':
        Orientation.lockToPortrait();
        break;
      case 'UNLOCKED':
      default:
        Orientation.unlockAllOrientations();
        break;
    }
  }, [orientationLock]);

  useEffect(() => {
    if (isClockRunning && gameClock > 0) {
      gameClockIntervalRef.current = setInterval(() => {
        setGameClock(prev => (prev > 0 ? prev - 1 : 0));
        if (isPenaltyClockRunning) {
            setPenaltyClock(prevPenalty => {
                if (prevPenalty <= 1) {
                    setIsPenaltyClockRunning(false);
                    setPowerPlayStatus('none');
                    return 0;
                }
                return prevPenalty - 1;
            });
        }
      }, 1000);
    } else if (gameClock <= 0) {
      setIsClockRunning(false);
    }
    
    return () => {
      if (gameClockIntervalRef.current) clearInterval(gameClockIntervalRef.current);
    };
  }, [isClockRunning, isPenaltyClockRunning, gameClock]);
  
  const toggleLive = useCallback(async () => {
    if (!isStreaming) {
        setError("Camera is not on.");
        return;
    }

    if (isLive) {
        streamRef.current?.stop();
        setIsLive(false);
        setConnectionStatus('closed');
    } else {
        const activeDestination = streamDestinations.find(d => d.id === activeStreamDestinationId);
        if (!recordLocally && !activeDestination) {
            setError("No stream destination selected.");
            return;
        }

        if(activeDestination?.name === 'YouTube' && !activeYoutubeBroadcast) {
            setError("No YouTube broadcast selected.");
            return;
        }

        let streamKey = activeDestination?.key;
        if (activeDestination?.name === 'YouTube') {
          streamKey = activeYoutubeBroadcast?.contentDetails?.ingestionInfo?.streamName;
          if (!streamKey) {
            setError("Selected YouTube broadcast has no stream key.");
            return;
          }
        }
        
        if(activeDestination && !streamKey && !recordLocally) {
             setError(`Stream key for ${activeDestination.name} is missing.`);
            return;
        }
        
        const streamUrl = (activeDestination && streamKey) ? `${activeDestination.url}${streamKey}` : null;
        
        if (streamUrl) {
           streamRef.current?.start();
           setConnectionStatus('connecting');
        } else if (!recordLocally) {
           setError('Cannot start live stream without a valid URL and key.');
           return;
        }

        setIsLive(true);
    }
  }, [isLive, isStreaming, recordLocally, activeStreamDestinationId, streamDestinations, activeYoutubeBroadcast]);

  const toggleStreaming = useCallback(() => {
    if (isStreaming) {
      if(isLive) toggleLive();
      setIsStreaming(false);
      KeepAwake.deactivate();
    } else {
      setIsStreaming(true);
      KeepAwake.activate();
    }
  }, [isStreaming, isLive, toggleLive]);
  
  const toggleMute = useCallback(() => {
     setIsMuted(!isMuted);
     setShowMuteOverlay(!isMuted);
     setTimeout(() => setShowMuteOverlay(false), 1500);
  }, [isMuted]);

  const toggleCamera = useCallback(() => {
    setCameraFacingMode(prev => prev === 'back' ? 'front' : 'back');
  }, []);

  const handleLogoSelect = useCallback((logoSrc: string) => {
    if(teamTarget === 'team1') setTeam1(t => ({...t, logo: logoSrc}));
    if(teamTarget === 'team2') setTeam2(t => ({...t, logo: logoSrc}));
    setIsLogoLibraryOpen(false);
  }, [teamTarget]);

  const handleSelectTeam = useCallback((teamData: Team) => {
    const updateTeam = (currentTeam: Team) => ({
      ...currentTeam, // keep score and other properties
      name: teamData.name,
      logo: teamData.logo,
      color: teamData.color,
    });

    if (teamTarget === 'team1') {
      setTeam1(updateTeam);
    }
    if (teamTarget === 'team2') {
      setTeam2(updateTeam);
    }
    setIsTeamLibraryOpen(false);
  }, [teamTarget]);

  const handleStatusUpdate = useCallback((code: string, msg: string) => {
    logger.info(`Stream status: ${code}`, { msg });
    switch(code) {
        case 'NetStream.Connect.Success':
            setConnectionStatus('connected');
            break;
        case 'NetStream.Publish.Start':
            setConnectionStatus('connected');
            break;
        case 'NetStream.Connect.Failed':
        case 'NetStream.Connect.Rejected':
            setConnectionStatus('failed');
            setError('Connection failed. Check stream key and URL.');
            setIsLive(false);
            break;
        case 'NetStream.Connect.Closed':
        case 'NetStream.Play.Stop':
            setConnectionStatus('closed');
            setIsLive(false);
            break;
        default:
            try {
                const data = JSON.parse(msg);
                if (data.bitrate > 0) {
                    setBitrateHistory(prev => {
                        const now = Date.now();
                        const newDataPoint = { timestamp: now, value: data.bitrate / 1024 }; // kbps
                        const nextHistory = [...prev, newDataPoint];
                        return nextHistory.filter(p => now - p.timestamp < 300000);
                    });
                }
                if (data.fps > 0) {
                    setRenderingFps(Math.round(data.fps));
                }
            } catch(e) { /* msg is not JSON, ignore */ }
            break;
    }
  }, []);

  const handleAddDestination = useCallback(async (data: StreamDestinationData) => {
    await addStreamDestination(data);
    setStreamDestinations(await getStreamDestinations());
  }, []);
  
  const handleUpdateDestination = useCallback(async (data: StreamDestinationPlain) => {
    await updateStreamDestination(data);
    setStreamDestinations(await getStreamDestinations());
  }, []);

  const handleDeleteDestination = useCallback(async (id: number) => {
    await deleteStreamDestination(id);
    setStreamDestinations(await getStreamDestinations());
  }, []);

  const handleScoreboardSettingsChange = useCallback((settings: ScoreboardSettings) => {
    setScoreboardSettings(settings);
  }, []);

  const activeDestination = useMemo(() => streamDestinations.find(d => d.id === activeStreamDestinationId), [streamDestinations, activeStreamDestinationId]);
  const streamKey = useMemo(() => activeDestination?.name === 'YouTube' ? activeYoutubeBroadcast?.contentDetails?.ingestionInfo?.streamName : activeDestination?.key, [activeDestination, activeYoutubeBroadcast]);
  const outputUrl = useMemo(() => (activeDestination && streamKey) ? `${activeDestination.url}${streamKey}` : undefined, [activeDestination, streamKey]);
  const videoSettings = useMemo(() => VIDEO_QUALITIES[streamQuality], [streamQuality]);

  const allPermissionsGranted = useMemo(() => 
    permissions.camera === 'granted' && 
    permissions.microphone === 'granted' && 
    permissions.storage === 'granted',
  [permissions]);
  
  if (!isAppReady) {
    return <LoadingScreen />;
  }
  
  if (!allPermissionsGranted) {
    const hasCheckedPermissions = Object.keys(permissions).length > 0;
    // Show loading screen while initial check happens
    if (!hasCheckedPermissions) {
      return <LoadingScreen />;
    }
    // If check is done and permissions are not granted, show the gate.
    return <PermissionsGate onGrant={requestPermissions} status={permissions} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar hidden={true} />
        <View style={styles.videoContainer}>
          {device && isStreaming ? (
            <NodeCameraView
              style={StyleSheet.absoluteFill}
              ref={streamRef}
              outputUrl={outputUrl}
              camera={{ cameraId: Number(device.id), cameraFrontMirror: cameraFacingMode === 'front' }}
              audio={{ bitrate: 128000, profile: 1, samplerate: 44100, isMuted: isMuted }}
              video={{
                preset: 4, // From documentation, 4 is for custom.
                bitrate: videoSettings.bitrate * (bitrateQuality === 'high' ? 1.5 : 1),
                profile: 2, // main
                fps: fps,
                videoFrontMirror: false,
                gop: fps * 2, // Standard 2-second GOP
                width: videoSettings.width,
                height: videoSettings.height
              }}
              zoomScale={zoomLevel}
              autopreview={true}
              denoise={true}
              smoothSkinLevel={3}
              onStatus={handleStatusUpdate}
            />
          ) : (
            <View style={styles.cameraOffContainer}>
              <CameraIcon size={96} color="#6B7280" />
              <Text style={styles.cameraOffText}>Camera is Off</Text>
            </View>
          )}

          {/* Overlays are rendered on top but not part of the stream */}
          <Scoreboard team1={team1} team2={team2} period={period} gameClock={gameClock} settings={scoreboardSettings} onSettingsChange={handleScoreboardSettingsChange} gameTitleBanner={gameTitleBanner} banner1={banner1} banner2={banner2} powerPlayStatus={powerPlayStatus} penaltyClock={penaltyClock}/>

          {!showSettings && !showControls && (
            <>
              <LiveIndicator isLive={isLive} />
              <View style={styles.topRightContainer}>
                <ConnectionIndicator status={connectionStatus} />
                <BatteryIndicator level={batteryStatus.level} charging={batteryStatus.charging} isSupported={batteryStatus.isSupported} />
              </View>
              {isStreaming && zoomCapabilities && <ZoomSlider value={zoomLevel} onChange={setZoomLevel} min={zoomCapabilities.min} max={zoomCapabilities.max} step={zoomCapabilities.step} />}
            </>
          )}

          {showMuteOverlay && (
              <View style={styles.muteOverlay}>
                  <MicrophoneOffIcon size={96} color="#EF4444" />
                  <Text style={styles.muteText}>MICROPHONE MUTED</Text>
              </View>
          )}

          {error && (
              <View style={styles.errorContainer}>
                  <AlertTriangleIcon size={24} color="#FFF" />
                  <Text style={styles.errorText}>{error}</Text>
                  <Pressable onPress={() => setError('')}><XIcon size={20} color="#FFF"/></Pressable>
              </View>
          )}
        </View>

        {!showSettings && !showControls && (
          <ControlBar 
            isStreaming={isStreaming} 
            isLive={isLive} 
            isMuted={isMuted}
            isLiveDisabled={!isStreaming || (!recordLocally && (!activeDestination || !streamKey))}
            onToggleStreaming={toggleStreaming} 
            onToggleLive={toggleLive}
            onToggleMute={toggleMute}
            onToggleCamera={toggleCamera}
            onShowSettings={() => setShowSettings(true)}
            onShowControls={() => setShowControls(true)}
          />
        )}
            
        <SettingsModal 
            isOpen={showSettings} 
            onClose={() => setShowSettings(false)}
            onShowLogViewer={() => { setShowLogViewer(true); }}
            recordLocally={recordLocally} 
            setRecordLocally={setRecordLocally}
            rememberSettings={rememberSettings} setRememberSettings={setRememberSettings}
            streamQuality={streamQuality} setStreamQuality={setStreamQuality}
            recordQuality={recordQuality} setRecordQuality={setRecordQuality}
            fps={fps} setFps={setFps}
            bitrateQuality={bitrateQuality} setBitrateQuality={setBitrateQuality}
            orientationLock={orientationLock} setOrientationLock={setOrientationLock}
            videoQualities={VIDEO_QUALITIES}
            streamDestinations={streamDestinations}
            activeStreamDestinationId={activeStreamDestinationId}
            setActiveStreamDestinationId={setActiveStreamDestinationId}
            onAddDestination={handleAddDestination}
            onUpdateDestination={handleUpdateDestination}
            onDeleteDestination={handleDeleteDestination}
            isAuthed={isAuthed}
            userInfo={userInfo}
            onSignIn={handleSignIn}
            onSignOut={handleSignOut}
            youtubeBroadcasts={youtubeBroadcasts}
            activeYoutubeBroadcast={activeYoutubeBroadcast}
            setActiveYoutubeBroadcast={setActiveYoutubeBroadcast}
            onScheduleStream={handleScheduleStream}
        />
        
        <HockeyControlPanel 
            isOpen={showControls} 
            onClose={() => setShowControls(false)}
            team1={team1} setTeam1={setTeam1}
            team2={team2} setTeam2={setTeam2}
            period={period} setPeriod={setPeriod}
            gameClock={gameClock} setGameClock={setGameClock}
            isClockRunning={isClockRunning} setIsClockRunning={setIsClockRunning}
            scoreboardSettings={scoreboardSettings} setScoreboardSettings={handleScoreboardSettingsChange}
            gameTitleBanner={gameTitleBanner} setGameTitleBanner={setGameTitleBanner}
            banner1={banner1} setBanner1={setBanner1}
            banner2={banner2} setBanner2={setBanner2}
            periodLengthMinutes={periodLengthMinutes} setPeriodLengthMinutes={setPeriodLengthMinutes}
            periodLengthSeconds={periodLengthSeconds} setPeriodLengthSeconds={setPeriodLengthSeconds}
            penaltyLengthMinutes={penaltyLengthMinutes} setPenaltyLengthMinutes={setPenaltyLengthMinutes}
            penaltyLengthSeconds={penaltyLengthSeconds} setPenaltyLengthSeconds={setPenaltyLengthSeconds}
            onOpenLogoLibrary={(target) => { setIsLogoLibraryOpen(true); setTeamTarget(target); }}
            onOpenTeamLibrary={(target) => { setIsTeamLibraryOpen(true); setTeamTarget(target); }}
            controlPanelOpacity={controlPanelOpacity} setControlPanelOpacity={setControlPanelOpacity}
            isPanelFrosted={isPanelFrosted} setIsPanelFrosted={setIsPanelFrosted}
            powerPlayStatus={powerPlayStatus} setPowerPlayStatus={setPowerPlayStatus}
            penaltyClock={penaltyClock} setPenaltyClock={setPenaltyClock}
            isPenaltyClockRunning={isPenaltyClockRunning} setIsPenaltyClockRunning={setIsPenaltyClockRunning}
            isMuted={isMuted} onToggleMute={toggleMute}
            isStreaming={isStreaming}
            zoomLevel={zoomLevel}
            setZoomLevel={setZoomLevel}
            zoomCapabilities={zoomCapabilities}
            bitrateHistory={bitrateHistory}
            renderingFps={renderingFps}
            isRecordingLocally={recordLocally}
        />

        <LogoLibraryModal 
            isOpen={isLogoLibraryOpen} 
            onClose={() => setIsLogoLibraryOpen(false)}
            onSelectLogo={handleLogoSelect}
        />

        <TeamLibraryModal
            isOpen={isTeamLibraryOpen}
            onClose={() => setIsTeamLibraryOpen(false)}
            onSelectTeam={handleSelectTeam}
        />

        <LogViewerModal
            isOpen={showLogViewer}
            onClose={() => setShowLogViewer(false)}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const AppWrapper: React.FC = () => (
  <RealmProvider schema={allDbModels}>
    <App />
  </RealmProvider>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  videoContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cameraOffContainer: { ...StyleSheet.absoluteFillObject, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' },
  cameraOffText: { color: '#9CA3AF', fontSize: 20, fontFamily: 'sans-serif' },
  topRightContainer: { position: 'absolute', top: 16, right: 16, zIndex: 30, flexDirection: 'row', gap: 8, alignItems: 'center' },
  muteOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 40 },
  muteText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  errorContainer: { position: 'absolute', bottom: 96, left: '10%', right: '10%', backgroundColor: 'rgba(220, 38, 38, 0.9)', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 12, zIndex: 50 },
  errorText: { color: 'white', flex: 1 },
});

export default AppWrapper;