export default class NameConverter {
    public static fqnToShortName(fqn: string): string {
        const splitted = fqn.split(".");
        return splitted[splitted.length - 1];
    }
}