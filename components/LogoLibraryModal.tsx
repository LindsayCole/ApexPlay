import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, FlatList, Image, Alert } from 'react-native';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { XIcon, UploadIcon, TrashIcon } from './Icons';
import { getLogos, addLogo, deleteLogo } from '../services/dbService';
import { logger } from '../services/loggingService';

interface Logo {
    id: string;
    src: string;
}

interface LogoLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectLogo: (logoSrc: string) => void;
}

export const LogoLibraryModal: React.FC<LogoLibraryModalProps> = ({ isOpen, onClose, onSelectLogo }) => {
    const [logos, setLogos] = useState<Logo[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadLogos = async () => {
        setIsLoading(true);
        try {
            const storedLogos = await getLogos();
            setLogos(storedLogos.reverse());
        } catch (error) {
            logger.error('Failed to load logos from DB', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) loadLogos();
    }, [isOpen]);

    const handleFileUpload = () => {
        launchImageLibrary({ mediaType: 'photo', includeBase64: true }, async (response: ImagePickerResponse) => {
            if (response.didCancel) {
                logger.info('User cancelled image picker');
            } else if (response.errorCode) {
                logger.error('ImagePicker Error: ', response.errorMessage);
                Alert.alert('Error', 'Could not open image library.');
            } else if (response.assets && response.assets[0].base64 && response.assets[0].type) {
                const newLogoSrc = `data:${response.assets[0].type};base64,${response.assets[0].base64}`;
                try {
                    await addLogo(newLogoSrc);
                    logger.info('New logo uploaded and saved.');
                    onSelectLogo(newLogoSrc);
                    onClose();
                } catch (error) {
                    logger.error('Failed to save new logo', error);
                }
            }
        });
    };
    
    const handleDeleteLogo = (id: string) => {
      Alert.alert('Delete Logo', 'Are you sure you want to delete this logo permanently?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
            try {
              await deleteLogo(id);
              logger.info(`Logo ${id} deleted.`);
              setLogos(logos.filter(logo => logo.id !== id));
            } catch (error) {
              logger.error(`Failed to delete logo ${id}`, error);
            }
        }},
      ]);
    };
    
    const handleSelect = (logo: Logo) => {
        onSelectLogo(logo.src);
        onClose();
    };

    return (
        <Modal visible={isOpen} transparent={true} animationType="fade" onRequestClose={onClose}>
            <View className="flex-1 bg-black/60 justify-center items-center p-4">
                <View className="bg-gray-800 rounded-2xl w-full max-w-xl h-[80vh] border border-gray-700">
                    <View className="p-4 border-b border-gray-700 flex-row justify-between items-center">
                        <Text className="text-xl font-bold text-white">Logo Library</Text>
                         <Pressable onPress={onClose} className="p-1 rounded-full bg-gray-700"><XIcon color="white" /></Pressable>
                    </View>
                    
                    <View className="p-4 flex-1">
                        {isLoading ? <Text className="text-center text-gray-400">Loading logos...</Text>
                        : <FlatList
                            data={logos}
                            keyExtractor={(item) => item.id}
                            numColumns={4}
                            ListEmptyComponent={<Text className="text-center text-gray-400">No saved logos.</Text>}
                            renderItem={({ item }) => (
                                <Pressable onPress={() => handleSelect(item)} className="flex-1 aspect-square bg-white/10 rounded-lg p-2 m-1 items-center justify-center">
                                    <Image source={{ uri: item.src }} className="w-full h-full" resizeMode="contain" />
                                    <Pressable onPress={() => handleDeleteLogo(item.id)} className="absolute top-1 right-1 p-1.5 bg-red-600/80 rounded-full">
                                        <TrashIcon color="white" size={16} />
                                    </Pressable>
                                </Pressable>
                            )}
                        />}
                    </View>

                    <View className="p-4 border-t border-gray-700">
                         <Pressable onPress={handleFileUpload} className="w-full flex-row items-center justify-center space-x-2 bg-purple-600 active:bg-purple-700 px-4 py-3 rounded-lg">
                            <UploadIcon color="white" />
                            <Text className="text-white text-sm font-semibold">Upload New Logo</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};