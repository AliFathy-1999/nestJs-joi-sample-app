import * as path from "path";
import { readFile } from "src/common/utils/file.util";

const basePath = path.join(process.cwd(), "src/common/constants/localization");

const locales = {
    en: readFile(path.join(basePath, "en/validation.json")),
    ar: readFile(path.join(basePath, "ar/validation.json")),
};

export { locales }