

import { locales } from "../constants/localization/localization";
import { ILocalize } from "src/common/interfaces/localization.interface";
import { Lang, LocalizedMessage } from "../enum/localization.enum";

/**
 * Type guard: Checks if a value is a LocalizedMessage object.
 * Ensures it has string values for all supported languages.
 */
const isLocalizedMessageObject = (msg: any): msg is LocalizedMessage =>
    msg &&
    typeof msg === "object" &&
    Object.values(Lang).every((key) => typeof msg[key] === "string");

/**
 * Resolves a localization key to a translated string.
 *
 * - Supports nested keys like 'field.error.type'
 * - Handles array indices by falling back to 'item' branch
 * - Injects context values (e.g., {#limit} -> actual limit)
 * - Falls back to the key itself if not found
 */
function localizeMessage({ key, lang, context }: ILocalize): string {
    const segments = key.split(".");
    let current: any = locales[lang];

    if (!current) {
        console.warn(`Missing locale for "${lang}".`);
        return key;
    }

    // Traverse nested keys
    for (const segment of segments) {
        if (segment in current) {
            current = current[segment];
            continue;
        }

        // Fallback for array indices
        if (/^\d+$/.test(segment) && current?.item) {
            current = current.item;
            continue;
        }

        console.warn(`Key "${key}" not found at "${segment}" for "${lang}".`);
        return key;
    }

    if (typeof current !== "string") {
        console.warn(`Key "${key}" does not resolve to a string for "${lang}".`);
        return key;
    }

    // Inject context values
    let result = current;
    for (const [ctxKey, ctxValue] of Object.entries(context || {})) {
        result = result.replace(`{#${ctxKey}}`, String(ctxValue));
    }

    return result;
}

export { isLocalizedMessageObject, localizeMessage }