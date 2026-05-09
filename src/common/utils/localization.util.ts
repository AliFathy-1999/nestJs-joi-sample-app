

import { locales } from "../constants/localization/localization";
import { ILocalize } from "src/common/interfaces/localization.interface";
import { Lang, LocalizedMessage } from "../enum/localization.enum";

// Type guard that checks whether a value matches the LocalizedMessage shape.
// It ensures the object has a string value for each supported language key.
const isLocalizedMessageObject = (msg: any): msg is LocalizedMessage =>
    msg &&
    typeof msg === "object" &&
    Object.values(Lang).every((key) => typeof msg[key] === "string");


// Resolve a localization key to a translated string for the requested language.
// Supports nested key paths like 'errors.user.notFound' and context interpolation.
// Numeric path segments are treated as array indexes and fallback to the 'item' locale branch.
function localizeMessage(data: ILocalize) {
    const { key, context, lang } = data;
    const segments = key.split(".");
    let current: any = locales[lang];

    const resolveSegment = (container: any, segment: string) => {
        if (segment in container) {
            return container[segment];
        }

        const isArrayIndex = /^\d+$/.test(segment);
        if (isArrayIndex && container && typeof container === "object" && "item" in container) {
            return container.item;
        }

        return undefined;
    };

    // Missing language
    if (!current) {
        console.warn(`Localization warning: missing locale for lang "${lang}".`);
        return key;
    }

    // Traverse nested keys, supporting numeric indexes for arrays.
    for (const segment of segments) {
        const next = resolveSegment(current, segment);
        if (next === undefined) {
            console.warn(
                `Localization warning: key "${key}" missing at segment "${segment}" in lang "${lang}".`
            );
            return key;
        }

        current = next;
    }

    // Must resolve to a string
    if (typeof current !== "string") {
        console.warn(
            `Localization warning: key "${key}" does not resolve to a string in lang "${lang}".`
        );
        return key;
    }

    // Inject Joi values {#limit}, {#value}, etc.
    let localized = current;
    for (const [ctxKey, ctxValue] of Object.entries(context || {})) {
        localized = localized.replace(`{#${ctxKey}}`, String(ctxValue));
    }

    return localized;
}


export { isLocalizedMessageObject, localizeMessage }