import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, FlatList, Image, Alert } from 'react-native';
import { XIcon, TrashIcon, CheckIcon } from './Icons';
import { getTeamPresets, deleteTeamPreset, TeamPresetData } from '../services/dbService';
import type { Team } from '../App';
import { logger } from '../services/loggingService';

interface TeamLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTeam: (teamData: Team) => void;
}

export const TeamLibraryModal: React.FC<TeamLibraryModalProps> = ({ isOpen, onClose, onSelectTeam }) => {
    const [teams, setTeams] = useState<(TeamPresetData & {id: string})[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadTeams = async () => {
        setIsLoading(true);
        try {
            const storedTeams = await getTeamPresets();
            setTeams(storedTeams.reverse());
        } catch (error) {
            logger.error('Failed to load team presets from DB', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { if (isOpen) loadTeams(); }, [isOpen]);

    const handleDelete = (id: string) => {
      Alert.alert('Delete Team', 'Are you sure you want to delete this team from your library?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: async () => {
            try {
                await deleteTeamPreset(id);
                logger.info(`Team preset ${id} deleted.`);
                setTeams(teams.filter(team => team.id !== id));
            } catch (error) {
                logger.error(`Failed to delete team preset ${id}`, error);
            }
          }}
      ]);
    };

    const handleSelect = (team: TeamPresetData) => {
        onSelectTeam(team as Team);
        onClose();
    };

    return (
        <Modal visible={isOpen} transparent={true} animationType="fade" onRequestClose={onClose}>
            <View className="flex-1 bg-black/60 justify-center items-center p-4">
                <View className="bg-gray-800 rounded-2xl w-full max-w-2xl h-[80vh] border border-gray-700">
                    <View className="p-4 border-b border-gray-700 flex-row justify-between items-center">
                        <Text className="text-xl font-bold text-white">Team Library</Text>
                        <Pressable onPress={onClose} className="p-1 rounded-full bg-gray-700"><XIcon color="white" /></Pressable>
                    </View>

                    <View className="p-4 flex-1">
                        {isLoading ? <Text className="text-center text-gray-400">Loading teams...</Text>
                        : <FlatList
                            data={teams}
                            keyExtractor={(item) => item.id}
                            ListEmptyComponent={<View className="p-8 items-center"><Text className="text-lg font-semibold text-white">Your library is empty.</Text><Text className="text-sm mt-2 text-gray-400">Go to the 'Teams' tab to edit a team and then click "Save Team".</Text></View>}
                            renderItem={({ item }) => (
                                <View className="bg-gray-900/50 p-3 rounded-lg flex-row items-center justify-between my-1">
                                    <View className="flex-row items-center space-x-4 flex-1">
                                        <View className="w-12 h-12 bg-black/20 rounded-md p-1 items-center justify-center">
                                            {item.logo ? <Image source={{ uri: item.logo }} className="w-full h-full" resizeMode="contain" /> : <Text className="text-2xl font-bold text-gray-500">?</Text>}
                                        </View>
                                        <View className="flex-row items-center space-x-3">
                                            <View style={{ backgroundColor: item.color }} className="w-5 h-5 rounded-full border-2 border-white/20" />
                                            <Text className="font-semibold text-white flex-shrink">{item.name}</Text>
                                        </View>
                                    </View>
                                    <View className="flex-row items-center space-x-2">
                                        <Pressable onPress={() => handleDelete(item.id)} className="p-2 bg-red-800/80 rounded-full"><TrashIcon color="white" size={16} /></Pressable>
                                        <Pressable onPress={() => handleSelect(item)} className="px-4 py-2 bg-purple-600 rounded-lg flex-row items-center space-x-2"><CheckIcon color="white" size={20} /><Text className="text-white font-semibold">Select</Text></Pressable>
                                    </View>
                                </View>
                            )}
                        />}
                    </View>
                </View>
            </View>
        </Modal>
    );
};