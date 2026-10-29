import AsyncStorage from '@react-native-async-storage/async-storage';
import { createDraftRepository } from './repository';
export const draftRepository = createDraftRepository(AsyncStorage);
