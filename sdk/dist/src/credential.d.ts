export declare class CredentialManager {
    private _token;
    token: string | undefined;
    static login(email: string, password: string): Promise<CredentialManager>;
}
