import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import Realm from 'realm';
import { 
    addStreamDestination, 
    getStreamDestinations, 
    updateStreamDestination,
    deleteStreamDestination,
    StreamDestinationPlain
} from '../../services/dbService';

let mockDb: { [key: string]: any[] } = {};
let mockRealmInstance: any;

// Manual mock of the Realm library to simulate its behavior in a Jest environment.
jest.mock('realm', () => {
  const actualRealm = jest.requireActual('realm');
  
  const mockRealm = {
    /**
     * Mocks the `objects` method to return a collection that simulates Realm.Results.
     * The returned objects have a `toJSON` method to mimic Realm.Object behavior.
     */
    objects: jest.fn((schemaName: string) => {
      const plainData = mockDb[schemaName] || [];
      const realmLikeData = plainData.map(d => ({ ...d, toJSON: () => d })); // Each object can be converted to JSON.

      const results = {
        sorted: jest.fn(() => realmLikeData), // Returns objects with a toJSON method.
        max: jest.fn(() => (plainData.length > 0 ? Math.max(...plainData.map(item => item.id)) : 0)),
        toJSON: jest.fn(() => plainData), // .toJSON() on the collection returns plain objects.
        find: jest.fn((callback: (item: any) => boolean) => realmLikeData.find(callback)),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        [Symbol.iterator]: realmLikeData[Symbol.iterator].bind(realmLikeData),
      };
      
      return results;
    }),
    /** Mocks the `write` transaction block. */
    write: jest.fn(callback => callback()),
    /** Mocks creating or updating an object in the database. */
    create: jest.fn((schemaName: string, data: any, mode?: string) => {
      if (!mockDb[schemaName]) mockDb[schemaName] = [];
      if (mode === Realm.UpdateMode.Modified) {
        const index = mockDb[schemaName].findIndex(item => item.id === data.id);
        if (index > -1) {
          mockDb[schemaName][index] = { ...mockDb[schemaName][index], ...data };
        }
      } else {
        mockDb[schemaName].push(data);
      }
    }),
    /** Mocks deleting an object from the database. */
    delete: jest.fn((obj: any) => {
      if (!obj || !obj.constructor || !obj.constructor.schema) return;
      const schemaName = obj.constructor.schema.name;
      if (mockDb[schemaName]) {
        mockDb[schemaName] = mockDb[schemaName].filter(item => item.id !== obj.id);
      }
    }),
    /** Mocks finding an object by its primary key. */
    objectForPrimaryKey: jest.fn((schemaName: string, primaryKey: any) => {
        const data = mockDb[schemaName] || [];
        const found = data.find(item => item.id === primaryKey);
        if (found) {
            // Return a mock Realm object that can be identified for deletion.
            return { ...found, constructor: { schema: { name: schemaName } } };
        }
        return null;
    }),
    isClosed: false,
    close: jest.fn(),
  };

  mockRealmInstance = mockRealm;

  return {
    Object: class MockObject {},
    open: jest.fn(() => Promise.resolve(mockRealm)),
    UpdateMode: { Modified: 'modified' },
    BSON: { ObjectId: class ObjectId {} },
  };
});

describe('dbService: StreamDestination', () => {

  beforeEach(() => {
    // Reset mock database and Jest mocks before each test
    mockDb = {
      StreamDestination: []
    };
    jest.clearAllMocks();
  });

  it('should add a new stream destination and assign an ID', async () => {
    const newDest = { name: 'TestTube', url: 'rtmp://test.com', key: 'test-key' };
    
    await addStreamDestination(newDest);

    expect(mockRealmInstance.create).toHaveBeenCalledWith('StreamDestination', { ...newDest, id: 1 });
    expect(mockDb.StreamDestination.length).toBe(1);
    expect(mockDb.StreamDestination[0].name).toBe('TestTube');
  });

  it('should get all stream destinations as plain objects', async () => {
    mockDb.StreamDestination = [
      { id: 1, name: 'Dest 1', url: 'url1', key: 'key1' },
      { id: 2, name: 'Dest 2', url: 'url2', key: 'key2' },
    ];
    
    const destinations = await getStreamDestinations();

    expect(destinations.length).toBe(2);
    expect(destinations[0].name).toBe('Dest 1');
    expect(destinations[1].url).toBe('url2');
    expect(mockRealmInstance.objects).toHaveBeenCalledWith('StreamDestination');
  });

  it('should update an existing stream destination', async () => {
    const initialDest: StreamDestinationPlain = { id: 1, name: 'Old Name', url: 'old_url', key: 'old_key' };
    mockDb.StreamDestination = [initialDest];

    const updatedDest: StreamDestinationPlain = { id: 1, name: 'New Name', url: 'new_url', key: 'new_key' };
    await updateStreamDestination(updatedDest);

    expect(mockRealmInstance.create).toHaveBeenCalledWith('StreamDestination', updatedDest, Realm.UpdateMode.Modified);
    expect(mockDb.StreamDestination[0].name).toBe('New Name');
    expect(mockDb.StreamDestination[0].url).toBe('new_url');
  });

  it('should delete a stream destination by its ID', async () => {
    mockDb.StreamDestination = [{ id: 1, name: 'To Delete', url: 'delete_url', key: 'delete_key' }];
    
    await deleteStreamDestination(1);

    expect(mockRealmInstance.objectForPrimaryKey).toHaveBeenCalledWith('StreamDestination', 1);
    expect(mockRealmInstance.delete).toHaveBeenCalled();
    expect(mockDb.StreamDestination.length).toBe(0);
  });

  it('should not throw an error when trying to delete a non-existent destination', async () => {
     mockDb.StreamDestination = [{ id: 1, name: 'Do Not Delete', url: 'dont_delete_url', key: 'dont_delete_key' }];

     await deleteStreamDestination(99); // A non-existent ID

     expect(mockRealmInstance.objectForPrimaryKey).toHaveBeenCalledWith('StreamDestination', 99);
     expect(mockRealmInstance.delete).not.toHaveBeenCalled();
     expect(mockDb.StreamDestination.length).toBe(1); // The original item should still be there
  });
});