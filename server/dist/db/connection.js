"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.options = exports.connection = void 0;
const mysql2_1 = __importDefault(require("mysql2"));
exports.connection = mysql2_1.default.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "authapp",
}).promise();
exports.options = {
    host: "localhost",
    user: "root",
    password: "1234",
    database: "authapp",
    schema: {
        tableName: 'sessions',
        dataWithOwnColumns: ['user'],
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'user',
            // user_id:'data.user'
            // user:'user'
        }
    }
};
