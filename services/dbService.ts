
/**
 * @file dbService.ts
 * @version 2.0.0
 * @author WeirdGoalieDad / Lindsay Cole
 * @dedication For Caden and Ryker.
 * @description Realm DB service for managing app data like logos, teams, and stream destinations.
 */
import Realm from 'realm';
import { logger } from './loggingService';

// --- REALM SCHEMAS ---

export class LogEntry extends Realm.Object<LogEntry> {
    _id!: Realm.BSON.ObjectId;
    level!: 'info' | 'warn' | 'error';
    message!: string;
    timestamp!: number;

    static schema: Realm.ObjectSchema = {
        name: 'LogEntry',
        primaryKey: '_id',
        properties: {
            _id: { type: 'objectId', default: () => new Realm.BSON.ObjectId() },
            level: 'string',
            message: 'string',
            timestamp: { type: 'int', indexed: true },
        },
    };
}

export type PlainLogEntry = {
    id: string;
    level: 'info' | 'warn' | 'error';
    message: string;
    timestamp: number;
}

export class Logo extends Realm.Object<Logo> {
    _id!: Realm.BSON.ObjectId;
    src!: string; // base64 data URL

    static schema: Realm.ObjectSchema = {
        name: 'Logo',
        primaryKey: '_id',
        properties: {
            _id: { type: 'objectId', default: () => new Realm.BSON.ObjectId() },
            src: 'string',
        },
    };
}

export class TeamPreset extends Realm.Object<TeamPreset> {
    _id!: Realm.BSON.ObjectId;
    name!: string;
    logo?: string; // base64 data URL or null
    color!: string;

    static schema: Realm.ObjectSchema = {
        name: 'TeamPreset',
        primaryKey: '_id',
        properties: {
            _id: { type: 'objectId', default: () => new Realm.BSON.ObjectId() },
            name: { type: 'string', indexed: true },
            logo: 'string?',
            color: 'string',
        },
    };
}

export class StreamDestination extends Realm.Object<StreamDestination> {
    id!: number;
    name!: string;
    url!: string;
    key!: string;
    
    static schema: Realm.ObjectSchema = {
        name: 'StreamDestination',
        primaryKey: 'id',
        properties: {
            id: 'int',
            name: 'string',
            url: 'string',
            key: 'string',
        }
    };
}

export const allDbModels: (Realm.ObjectSchema | Realm.ObjectClass)[] = [LogEntry, Logo, TeamPreset, StreamDestination];

// --- DATA ACCESS FUNCTIONS (ASYNC) ---

let realmInstance: Realm | null = null;
const getRealm = async (): Promise<Realm> => {
    if (realmInstance === null || realmInstance.isClosed) {
        realmInstance = await Realm.open({ schema: allDbModels, schemaVersion: 2 });
    }
    return realmInstance;
};

// --- LOG FUNCTIONS ---

export const addLogEntry = async (entry: Omit<PlainLogEntry, 'id'>): Promise<void> => {
    const realm = await getRealm();
    try {
        realm.write(() => {
            realm.create('LogEntry', {
                ...entry,
                message: String(entry.message),
            });
        });
    } catch (e) {
        console.error("Realm: Failed to add log entry", e);
    }
};

export const getLogEntries = async (): Promise<PlainLogEntry[]> => {
    const realm = await getRealm();
    try {
        const logs: Realm.Results<LogEntry & Realm.Object> = realm.objects('LogEntry').sorted('timestamp', true) as any;
        return logs.map(l => ({ 
            id: l._id.toHexString(), 
            level: l.level,
            message: l.message,
            timestamp: l.timestamp 
        }));
    } catch (e) {
        logger.error("Realm: Failed to get logs", e);
        return [];
    }
};

export const clearAllLogEntries = async (): Promise<void> => {
    const realm = await getRealm();
    try {
        realm.write(() => {
            realm.delete(realm.objects('LogEntry'));
        });
    } catch (e) {
        logger.error("Realm: Failed to clear logs", e);
    }
};

// --- LOGO FUNCTIONS ---

export const addLogo = async (logoSrc: string): Promise<void> => {
    const realm = await getRealm();
    realm.write(() => {
        realm.create('Logo', { src: logoSrc });
    });
};

export const getLogos = async (): Promise<{id: string, src: string}[]> => {
    const realm = await getRealm();
    const logos: Realm.Results<Logo & Realm.Object> = realm.objects('Logo').sorted('_id', true) as any;
    return logos.map(l => ({ id: l._id.toHexString(), src: l.src }));
};

export const deleteLogo = async (id: string): Promise<void> => {
    const realm = await getRealm();
    realm.write(() => {
        const logoToDelete = realm.objectForPrimaryKey('Logo', new Realm.BSON.ObjectId(id));
        if (logoToDelete) realm.delete(logoToDelete);
    });
};

// --- TEAM PRESET FUNCTIONS ---

export interface TeamPresetData { name: string; logo: string | null; color: string; }

export const addTeamPreset = async (teamData: TeamPresetData): Promise<void> => {
    const realm = await getRealm();
    realm.write(() => {
        realm.create('TeamPreset', { ...teamData });
    });
};

export const getTeamPresets = async (): Promise<(TeamPresetData & {id: string})[]> => {
    const realm = await getRealm();
    const presets: Realm.Results<TeamPreset & Realm.Object> = realm.objects('TeamPreset').sorted('name') as any;
    return presets.map(p => ({ id: p._id.toHexString(), name: p.name, logo: p.logo || null, color: p.color }));
};

export const deleteTeamPreset = async (id: string): Promise<void> => {
    const realm = await getRealm();
    realm.write(() => {
        const presetToDelete = realm.objectForPrimaryKey('TeamPreset', new Realm.BSON.ObjectId(id));
        if (presetToDelete) realm.delete(presetToDelete);
    });
};

// --- STREAM DESTINATION FUNCTIONS ---

export type StreamDestinationData = { name: string; url: string; key: string; }
export type StreamDestinationPlain = StreamDestinationData & { id: number; }

const getNextStreamDestinationId = async (realm: Realm): Promise<number> => {
    const maxId = realm.objects<StreamDestination>('StreamDestination').max('id') as number | undefined;
    return (maxId || 0) + 1;
};

export const addStreamDestination = async (data: StreamDestinationData): Promise<void> => {
    const realm = await getRealm();
    await realm.write(async () => {
        const nextId = await getNextStreamDestinationId(realm);
        realm.create<StreamDestination>('StreamDestination', { ...data, id: nextId });
    });
};

export const getStreamDestinations = async (): Promise<StreamDestinationPlain[]> => {
    const realm = await getRealm();
    const destinations: Realm.Results<StreamDestination & Realm.Object> = realm.objects('StreamDestination').sorted('id') as any;
    return destinations.map(d => (d.toJSON() as StreamDestinationPlain));
};

export const updateStreamDestination = async (data: StreamDestinationPlain): Promise<void> => {
    const realm = await getRealm();
    realm.write(() => {
        realm.create('StreamDestination', data, Realm.UpdateMode.Modified);
    });
};

export const deleteStreamDestination = async (id: number): Promise<void> => {
    const realm = await getRealm();
    realm.write(() => {
        const destToDelete = realm.objectForPrimaryKey('StreamDestination', id);
        if (destToDelete) realm.delete(destToDelete);
    });
};
