export interface LocalizedText {
    en: string;
    ar: string;
}

export interface AppResponseEntry {
    message: LocalizedText;
    status?: number;
}

export interface AppResponseMessagesInterface {
    ERROR: {
        UNKNOWN_ERROR: AppResponseEntry;
    };
    SUCCESS: {
        SERVICE_IS_RUNNING: AppResponseEntry;
    };
}
