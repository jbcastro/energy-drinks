const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 8000;
const users ='users';
const drinks = 'drinks'
var bodyParser = require('body-parser')
app.use(bodyParser.json());
const path = require('path');
//getting database login information
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PWD,
  database: process.env.MYSQL_DB,
});

app.listen(port, () => {
  console.log(`App server now listening to port ${port}`);
});

app.use(express.static(path.join(__dirname,'/build')));
app.set("view engine", "ejs");

app.get("/", function (req, res) {
  res.render("/index", {});
});
//getting all users
app.get('/api/users', (req, res) => {
  pool.query(`select * from ${users}`, (err, rows) => {
    if (err) {
      res.send(err);
    } else {
      res.send(rows);
    }
  });
});

//getting all drinks
app.get('/api/drinks', (req, res) => {
  pool.query(`select * from ${drinks}`, (err, rows) => {
    if (err) {
      res.send(err);
    } else {
      res.send(rows);
    }
  });
});

//adding a name to the sql DB
app.post('/api/addName',function(req,res,next){
  const name = req.body.full_name
  pool.query(`INSERT INTO users (full_name) VALUES('${name}')`,function(error,results,fields){
    if(error) throw error;
    res.send(JSON.stringify(results))
  })
})
//adding a drink to the sql DB
app.post('/api/addEntry',function(req,res,next){
  const drink_name = req.body.drink_name
  const drink_oz=req.body.drink_oz
  const personID = req.body.PersonID
  const dateAdded = req.body.dateAdded
  pool.query(`INSERT INTO drinks (drink_name,drink_oz,PersonID,dateAdded) VALUES('${drink_name}','${drink_oz}','${personID}','${dateAdded}')`,function(error,results,fields){
    if(error) throw error;
    res.send(JSON.stringify(results))
  })
})
