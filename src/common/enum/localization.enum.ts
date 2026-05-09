enum Lang {
    EN = "en",
    AR = "ar",
}
type LocalizedMessage = Record<Lang, string>;

export { Lang, LocalizedMessage }