"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const environment_1 = require("../common/environment");
const node_fetch_1 = require("node-fetch");
class Logger {
    constructor(userId, sessionId) {
        this.userId = userId;
        this.sessionId = sessionId;
    }
    debug(primaryMessage, ...supportingData) {
        this.emitLogMessage("debug", primaryMessage, supportingData);
    }
    warn(primaryMessage, ...supportingData) {
        this.emitLogMessage("warn", primaryMessage, supportingData);
    }
    error(primaryMessage, ...supportingData) {
        this.emitLogMessage("error", primaryMessage, supportingData);
    }
    info(primaryMessage, ...supportingData) {
        this.emitLogMessage("info", primaryMessage, supportingData);
    }
    emitLogMessage(msgType, msg, supportingDetails) {
        const mapa = supportingDetails[0];
        const iterador = mapa.entries();
        let obj = {};
        let aux = iterador.next().value;
        while (aux !== undefined) {
            obj[aux[0]] = aux[1];
            aux = iterador.next().value;
        }
        var body = { 'msgType': msgType,
            'msg': msg,
            'userId': this.userId,
            'sessionId': this.sessionId,
            'log': obj
        };
        console.warn('Sending...', body);
        console.log(JSON.stringify(body));
        node_fetch_1.default(environment_1.environment.log.url + '/events', {
            headers: { "Content-Type": "application/json; charset=utf-8",
                "Authorization": "Bearer " + this.sessionId
            },
            method: 'POST',
            body: JSON.stringify(body)
        }).then(response => response.json())
            .then(json => console.log(json))
            .catch(error => {
        });
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map