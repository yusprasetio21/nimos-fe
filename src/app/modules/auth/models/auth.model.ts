export class AuthModel {
    tokenType: string;
    expiresIn: Date;
    accessToken: string;
    refreshToken: string;

    setAuth(auth: AuthModel) {
        this.tokenType = auth.tokenType;
        this.expiresIn = auth.expiresIn;
        this.accessToken = auth.accessToken;
        this.refreshToken = auth.refreshToken;
    }
}
