import { FieldPacket, RowDataPacket } from "mysql2";
import { connection } from "../db/connection";

export async function deleteSessions(userId: string): Promise<void> {
    const [sessionRows, sessionFields]: [RowDataPacket[], FieldPacket[]] =
        await connection.query(
          `SELECT * FROM sessions WHERE JSON_EXTRACT(user, '$.user') = ${userId};`
          
        );

      for (let i = 0; i < sessionRows?.length; i++) {
        try {
          const element = sessionRows[i];
          await connection.query("DELETE FROM sessions WHERE session_id = ? ", [
            element.session_id,
          ]);
        } catch (error) {
            console.log(error);
            
          throw new Error('something went wrong')
        }
      }
}