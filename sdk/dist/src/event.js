"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Event {
    constructor() {
        this.logs = new Map();
        //    this.logs = new Object()
    }
    set(key, records) {
        this.logs.set(key, records);
    }
    get(key) {
        return this.logs.get(key);
    }
    push(key, value) {
        const records = this.logs.get(key);
        if (records !== undefined) {
            records.push(value);
        }
        else {
            this.logs.set(key, [value]);
        }
    }
    dump() {
        return this.logs;
    }
}
exports.Event = Event;
//# sourceMappingURL=event.js.map