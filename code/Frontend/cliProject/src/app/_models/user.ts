export class User {
    username: string;
    basicAuth: string;
    password: string;
    password2: string;

    constructor(username: string,basicAuth: string) {
        this.username = username;
        this.basicAuth = basicAuth;
    }
}
