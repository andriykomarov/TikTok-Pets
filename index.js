// index.js
// This is our main server file

// include express
const express = require("express");
const bodyParser = require('body-parser');
// create object to interface with express
const app = express();

//const fetch = require("cross-fetch");

const db = require('./public/sqlWrap');
const win = require('./public/pickWinner');
//clearDB()

/* might be a useful function when picking random videos */
function getRandomInt(max) {
  let n = Math.floor(Math.random() * max);
  // console.log(n);
  return n;
}

// Code in this section sets up an express pipeline

// print info about incoming HTTP request 
// for debugging
app.use(function(req, res, next) {
  console.log(req.method, req.url);
  next();
})

// make all the files in 'public' available 
app.use(express.static("public"));

// if no file specified, return the main page
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/public/myVideos.html");
});

app.use(bodyParser.json());

app.post('/videoData', (req, res) => {
  console.log("Server recieved a post request at", req.url);
  inputs = req.body;

  getDBCount().then(function(result) {

    console.log(result['count(1)'])

    if (result['count(1)'] >= 8) {
      console.log("ERROR SIZE LIMIT")
      res.status(403).send("Database Full")
    } else {
      res.send(inputs.nickname)

      updateFlags().then(function() {
        console.log("Updated Flags!")

        insertVideo(inputs).then(function() {
          console.log("success!")
          dumpTable().then(function(result) {
            console.log("whole table\n", result);
          })
        }).catch(function(err) {
          console.log("SQL error", err)
        });

      }).catch(function(err) {
        console.log("ERROR", err)
      });

    }

  }).catch(function(err) {
    console.log(err)
  })

});

app.post('/deleteVid', (req, res) => {
  console.log("Server recieved a delete request at", req.url);
  input = req.body;
  console.log(input.nickname)

  deleteVideo(input.nickname).then(function() {
    console.log("Successfully deleted", input.nickname)
    res.status(200).send("Deleted from database")
    dumpTable().then(function(result) {
      console.log("whole table\n", result);
    })
  }).catch(function(err) {
    console.log("Error: Could not Delete the Given Video", err)
    res.status(404)
  })
});


app.get('/getMostRecent', (req, res) => {
  console.log("Server recieved a get request at", req.url);
  getMostRecentVideo().then(function(result) {
    res.type('json')
    res.send(result)
  }).catch(function(err) {
    console.log("Error", err)
  })
})

app.get('/getList', (req, res) => {
  console.log("Server recieved a get request at", req.url);
  dumpTable().then(function(result) {
    res.type('json')
    res.send(result)
  }).catch(function(err) {
    console.log("Error", err)
  })
})

app.get("/getWinner", async function(req, res) {
  console.log("getting winner");
  try {
    // change parameter to "true" to get it to computer real winner based on PrefTable 
    // with parameter="false", it uses fake preferences data and gets a random result.
    // winner should contain the rowId of the winning video.
    let winner = await win.computeWinner(8, false)
    let winningVid = await getVideo(winner)
    console.log(winningVid)

    // you'll need to send back a more meaningful response here.
    res.json(winningVid);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get("/getTwoVideos", async function(req, res) {
  getTwoVideos().then(function(result) {
    res.type('json')
    console.log(result)
    res.send(result)
  }).catch(function(error) {
    console.log("ERROR", error)
  })
});

app.post("/insertPref", async function(req, res) {
  console.log(req.body)
  let pref = req.body;
  insertPref(pref).then(function() {
    getDBCount().then(function(result) {
      if (result['count(1)'] >= 16) {
        res.type('txt')
        res.send('pick winner')
      } else {
        res.type('txt')
        res.send('continue')
      }
    }).catch(function(error) {
      console.log("ERROR", error)
    })
  }).catch(function(error) {
    console.log("ERROR", error)
  })
});

// Need to add response if page not found!
app.use(function(req, res) {
  res.status(404);
  res.type('txt');
  res.send('404 - File ' + req.url + ' not found');
});
// end of pipeline specification

// Now listen for HTTP requests
// it's an event listener Fon the server!
const listener = app.listen(3000, function() {
  console.log("The static server is listening on port " + listener.address().port);
});

async function getTwoVideos() {
  // warning! You can only use ? to replace table data, not table name or column name.
  const sql = 'select * from VideoTable where rowIdNum IN (select rowIdNum from VideoTable order by random() limit 2)';
  // Check if the two videos we got have already been compared before. 
  const sql2 = 'select exists (select 1 from PrefTable where (better=? and worse=?) or (better=? and worse=?))'
  let result = await db.all(sql);
  let result2 = await db.get(sql2, [result[0].rowIdNum, result[1].rowIdNum, result[1].rowIdNum, result[0].rowIdNum]);
  // Extracting the 0 or 1. 
  let seenBefore = result2['exists (select 1 from PrefTable where (better=? and worse=?) or (better=? and worse=?))']
  // While we have a duplicate keep asking the database for two more videos. 
  while (seenBefore === 1) {
    console.log("Caught a duplicate")
    result = await db.all(sql);
    result2 = await db.get(sql2, [result[0].rowIdNum, result[1].rowIdNum, result[1].rowIdNum, result[0].rowIdNum]);
    seenBefore = result2['exists (select 1 from PrefTable where (better=? and worse=?) or (better=? and worse=?))']
  }
  return result;
}

async function insertVideo(v) {
  const sql = "insert into VideoTable (url,nickname,userid,flag) values (?,?,?,TRUE)";
  await db.run(sql, [v.url, v.nickname, v.userid]);
}

async function dumpTable() {
  const sql = "select * from VideoTable"
  let result = await db.all(sql)
  return result;
}

async function insertPref(pref) {
  const sql = "insert into PrefTable (better,worse) values (?,?)"
  await db.run(sql, [pref.better, pref.worse])
}

async function getVideo(rowIdNum) {
  // warning! You can only use ? to replace table data, not table name or column name.
  const sql = 'select * from VideoTable where rowIdNum = ?';
  let result = await db.get(sql, [rowIdNum]);
  return result;
}

async function getMostRecentVideo() {
  const sql = 'select * from VideoTable where flag = TRUE'
  let result = await db.get(sql)
  console.log(typeof (result))
  return JSON.stringify(result)
}

async function updateFlags() {
  const sql = 'update VideoTable set flag = FALSE'
  await db.run(sql)
}

async function deleteVideo(nickname) {
  const sql = 'delete from VideoTable where nickname = ?';
  await db.run(sql, [nickname]);
}

async function getDBCount() {
  const sql = 'select count(1) from VideoTable'
  let result = await db.get(sql)
  return result
}

async function clearDB() {
  db.deleteEverything()
}