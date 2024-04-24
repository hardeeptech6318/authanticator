import mysql from "mysql2";

export const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "authapp",
}).promise();


export const options = {
  host: "localhost",
  user: "root",
  password: "1234",
  database: "authapp",
  schema: {
		tableName: 'sessions',
    dataWithOwnColumns: [ 'user' ],
		columnNames: {
			session_id: 'session_id',
			expires: 'expires',
			data: 'user',
      
      // user_id:'data.user'
      // user:'user'
		}
	}
};