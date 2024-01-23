const mysql = require("mysql");
const express = require("express");

// 데이터베이스 설정
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });
  
  db.connect((err) => {
    if (err) throw err;
    console.log("@@@@@@Connected to the MySQL server.@@@@@@");
  });
  
  module.exports = db;