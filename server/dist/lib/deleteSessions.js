"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSessions = void 0;
const connection_1 = require("../db/connection");
async function deleteSessions(userId) {
    const [sessionRows, sessionFields] = await connection_1.connection.query(`SELECT * FROM sessions WHERE JSON_EXTRACT(user, '$.user') = ${userId};`);
    for (let i = 0; i < sessionRows?.length; i++) {
        try {
            const element = sessionRows[i];
            await connection_1.connection.query("DELETE FROM sessions WHERE session_id = ? ", [
                element.session_id,
            ]);
        }
        catch (error) {
            console.log(error);
            throw new Error('something went wrong');
        }
    }
}
exports.deleteSessions = deleteSessions;
