"use strict";
exports.__esModule = true;
var environment_1 = require("../common/environment");
var node_fetch_1 = require("node-fetch");
var CredentialManager = /** @class */ (function () {
    function CredentialManager() {
    }
    Object.defineProperty(CredentialManager.prototype, "token", {
        get: function () { return this._token; },
        set: function (token) { this._token = token; },
        enumerable: true,
        configurable: true
    });
    CredentialManager.login = function (email, password) {
        console.log("Já tá aqui brabo");
        var body = {
            'email': email,
            'password': password
        };
        return new Promise(function (resolve, reject) {
            node_fetch_1["default"](environment_1.environment.log.url + '/users/authenticate', {
                headers: { "Content-Type": "application/json; charset=utf-8" },
                method: 'POST',
                body: JSON.stringify(body)
            })
                .then(function (response) { return response.json(); })
                .then(function (json) {
                console.log(json['accessToken']);
                var credential = new CredentialManager();
                credential._token = json['accessToken'];
                resolve(credential);
            })["catch"](function (error) {
                reject(error);
            });
        });
    };
    return CredentialManager;
}());
exports.CredentialManager = CredentialManager;
