export declare class CredentialManager {
    private _token;
    get token(): string | undefined;
    set token(token: string | undefined);
    static login(email: string, password: string): Promise<CredentialManager>;
}
