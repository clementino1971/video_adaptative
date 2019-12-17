"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const environment_1 = require("../common/environment");
const node_fetch_1 = require("node-fetch");
class CredentialManager {
    get token() { return this._token; }
    set token(token) { this._token = token; }
    static login(email, password) {
        var body = {
            'email': email,
            'password': password
        };
        return new Promise((resolve, reject) => {
            node_fetch_1.default(environment_1.environment.log.url + '/users/authenticate', {
                headers: { "Content-Type": "application/json; charset=utf-8" },
                method: 'POST',
                body: JSON.stringify(body)
            })
                .then(response => response.json())
                .then(json => {
                console.warn(json['accessToken']);
                const credential = new CredentialManager();
                credential._token = json['accessToken'];
                resolve(credential);
            })
                .catch(error => {
                reject(error);
            });
        });
    }
}
exports.CredentialManager = CredentialManager;
//# sourceMappingURL=credential.js.map