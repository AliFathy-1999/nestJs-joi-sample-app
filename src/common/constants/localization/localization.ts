import * as path from "path";
import { readFile } from "src/common/utils/file.util";

/**
 * Localization: Loads and provides access to JSON-based locale data.
 *
 * - Uses readFile utility to load English and Arabic validation messages
 * - Provides locales object with en/ar keys for direct access
 * - Used by localizeMessage() for key resolution and interpolation
 */
const basePath = path.join(process.cwd(), "src/common/constants/localization");

const locales = {
    en: readFile(path.join(basePath, "en/validation.json")),
    ar: readFile(path.join(basePath, "ar/validation.json")),
};

export { locales };