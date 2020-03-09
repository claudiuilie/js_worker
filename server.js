const express = require('express');
const WorkerPool = require('./worker_pool.js');
const os = require('os');
const thread = 10
const pool = new WorkerPool(thread);
const arrayBuilder = require('./array_builder');

const app = express();
const port = 3000;
var list = {};


//start worker
app.post('/', (req, res) => {

    var params = req.query;
    var task = new arrayBuilder(params.id, params.magnet);
    pool.runTask(task.buff, (err, result) => {
        //when finish or error
        console.log(err);

    });

    list[`${params.id}`] = task; 
    res.send("Sent to worker - id:")
    
});

//find solution to get worker progress
app.get('/', (req, res) => {
    let id = req.query.id;
    res.send(list[`${id}`]);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))



// CREATE TABLE `movies` (
//     `id` int(11) NOT NULL AUTO_INCREMENT,
//     `title` varchar(100) NOT NULL,
//     `size` varchar(10) NOT NULL,
//     `seeders` varchar(10) NOT NULL,
//     `peers` varchar(10) NOT NULL,
//     `upload_date` varchar(10) DEFAULT NULL,
//     `magnet_link` varchar(100) NOT NULL,
//     `imdb_url` varchar(50) DEFAULT NULL,
//     `thumbnail` varchar(100) DEFAULT NULL,
//     `description` varchar(100) DEFAULT NULL,
//     `rating_value` varchar(10) DEFAULT NULL,
//     `rating_count` varchar(10) DEFAULT NULL,
//     `review_count` varchar(10) DEFAULT NULL,
//     `torr_posted` int(11) NOT NULL DEFAULT 0,
//     `torr_progress` int(11) NOT NULL DEFAULT 0,
//     `torr_pause` int(11) NOT NULL DEFAULT 0,
//     `torr_finish` int(11) NOT NULL DEFAULT 0,
//     `torr_error` int(11) NOT NULL DEFAULT 0,
//     `torr_mb_s` int(11) NOT NULL DEFAULT 0,
//     `created` timestamp NOT NULL DEFAULT current_timestamp(),
//     `modified` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
//     PRIMARY KEY (`id`)
//   ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
  