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
app.post('/download', (req, res) => {

    let params = req.query;
    let task = new arrayBuilder(params.id, params.magnet);
    let taskId = typeof list[`${params.id}`]
    let response = {posted: false, error: false};

    if(taskId == 'undefined'){
        
        list[`${params.id}`] = task;
        pool.runTask(task, (err, result) => {
            //when finish or error
            if (err){
                console.log(3)
                response.error = err;
            }else{
                console.log(2)
                response.error = result.error;
                response.posted = result.posted;
            }
            console.log(1)
            console.log(result)
            console.log(response)
            res.send(response)
        });
    }else if(taskId == 'object'){
        res.send({posted: false, error: "Tracker is already posted."})
    }
    
});

app.get('/', (req, res) => {
    let id = req.query.id;
    res.send(list);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))