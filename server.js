const express = require('express');
const WorkerPool = require('./worker_pool.js');
const os = require('os');
const thread = 10
const pool = new WorkerPool(thread);
const arrayBuilder = require('./array_builder');

const app = express();
const port = 3000;
let list = {};

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
//start worker
app.post('/', (req, res) => {

    let params = req.query;
    let task = new arrayBuilder(params.id, params.magnet);
    let taskId = typeof list[`${params.id}`]
    
    if(taskId == 'undefined'){

        list[`${params.id}`] = task;
        pool.runTask(task, (err, result) => {
            //when finish or error
            console.log(err);
    
        });

        res.send("Sent to worker - id:" + params.id)

    }else if(taskId == 'object'){
        res.send("Worker already started - id:" + params.id)
    }
    
});

app.get('/', (req, res) => {
    let id = req.query.id;
    res.send(list);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))