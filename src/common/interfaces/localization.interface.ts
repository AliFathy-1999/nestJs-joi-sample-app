import { Lang } from "../enum/localization.enum";

type localizationType = 'en' | 'ar';
interface ILocalize {
    key: string,
    lang: Lang,
    context: Record<string, any>
}
interface ILanguages {
    en: string;
    ar: string;
}
export { localizationType, ILocalize, ILanguages }