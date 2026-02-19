"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAdapter = void 0;
class BaseAdapter {
    constructor(connection) {
        this.connection = connection;
    }
    // Helper to handle API requests (could be replaced by specific library)
    async request(method, endpoint, data) {
        throw new Error('Method not implemented.');
    }
}
exports.BaseAdapter = BaseAdapter;
