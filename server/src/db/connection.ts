import mysql from "mysql2";

export const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "authapp",
});


export const options = {
  host: "localhost",
  user: "root",
  password: "1234",
  database: "authapp",
};