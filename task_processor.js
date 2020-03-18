const { parentPort } = require('worker_threads');
const webtorrent = require('webtorrent');
const options = require("./config");
const mysql = require('./mysql_controller');
const config = new options();
let mysqlController = new mysql(config.mysql);
let client = new webtorrent()


parentPort.on('message', (task) => {

    var progress = new Int8Array(task.buff);
    downloadTorrent(task, progress)
});


function downloadTorrent(task, progress){

    function prettyBytes(num){
         var exponent, unit, neg = num < 0, units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
         if (neg) num = -num
         if (num < 1) return (neg ? '-' : '') + num + ' B'
         exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1)
         num = Number((num / Math.pow(1000, exponent)).toFixed(2))
         unit = units[exponent]
         return (neg ? '-' : '') + num + ' ' + unit
     }
        
     client.add(task.magnet, { path: '/temp/' }, function (torrent) {
      parentPort.postMessage({error: false, posted: true});
      
         let interval = setInterval(function () {
             // posted
             progress[0] = 1;
             //paused
             progress[2] = torrent.paused ? 1 : 0;
             //mb/ps
             progress[4] = parseInt(prettyBytes(torrent.downloadSpeed));
             //progress
             progress[5] = parseInt(torrent.progress * 100);
             //peers
             progress[6] = parseInt(torrent.numPeers);
             //active
             progress[8] = 1;
             // remaining in sec
             progress[9] = Math.floor((torrent.timeRemaining / 1000) % 60);
             //total download in min
             progress[10] = Math.floor((torrent.timeRemaining / (60 * 1000)) % 60);
             //total download in hours
             progress[11] = Math.floor(((torrent.timeRemaining / (60 * 1000 * 60 )) % 24));

             let torr = {
              "torr_posted":progress[0],
              "torr_finish":progress[1],
              "torr_paused":progress[2],
              "torr_error":progress[3],
              "torr_mb_s":progress[4],
              "torr_progress":progress[5],
              "on_disk":progress[7],
              "torr_active":progress[8]
            }

             mysqlController.update('watchlist',torr,{"id": task.id},(error,results) => {
              if(error) {
                  console.log(error);
              } else {
                  if (results.affectedRows > 0 ) {
                      console.log(results.message)
                  }
              }
            });

          //  console.log(prettyBytes(torrent.downloadSpeed) + '/s')
          //  console.log('Progress: ' + (torrent.progress * 100).toFixed(1) + '%')
          //  console.log('NumPeers: '+ torrent.numPeers)
          //  console.log('Paused: '+torrent.paused)
         }, 2000)
          
         torrent.on('done', function () {
           //finish
            progress[1] = 1;
            progress[7] = 1;
            progress[8] = 0;
            progress[5] = 100;

            let torr = {
              "torr_posted":progress[0],
              "torr_finish":progress[1],
              "torr_paused":progress[2],
              "torr_error":progress[3],
              "torr_mb_s":progress[4],
              "torr_progress":progress[5],
              "on_disk":progress[7],
              "torr_active":progress[8]
            }

             mysqlController.update('watchlist',torr,{"id": task.id},(error,results) => {
              if(error) {
                  console.log(error);
              } else {
                  if (results.affectedRows > 0 ) {
                      console.log(results.message)
                  }
              }
            });

           console.log('torrent download finished')
           
           clearInterval(interval)
           //destroy torrent
           torrent.destroy();
         })
       
         torrent.on('ready', function () {console.log('Ready to use')})
         torrent.on('error', function (err) {
            progress[0] = 1;
            progress[3] = 1
            progress[8] = 0;

            let torr = {
              "torr_posted":progress[0],
              "torr_finish":progress[1],
              "torr_paused":progress[2],
              "torr_error":progress[3],
              "torr_mb_s":progress[4],
              "torr_progress":progress[5],
              "on_disk":progress[7],
              "torr_active":progress[8]
            }

             mysqlController.update('watchlist',torr,{"id": task.id},(error,results) => {
              if(error) {
                  console.log(error);
              } else {
                  if (results.affectedRows > 0 ) {
                      console.log(results.message)
                  }
              }
            });
            console.log('error')
             console.log(err)
        })
         // torrent.on('warning', function (err) {console.log(err)})
         torrent.on('noPeers', function (announceType) {
            progress[0] = 1;
            

            let torr = {
              "torr_posted":progress[0],
              "torr_finish":progress[1],
              "torr_paused":progress[2],
              "torr_error":progress[3],
              "torr_mb_s":progress[4],
              "torr_progress":progress[5],
              "on_disk":progress[7],
              "torr_active":progress[8]
            }

             mysqlController.update('watchlist',torr,{"id": task.id},(error,results) => {
              if(error) {
                  console.log(error);
              } else {
                  if (results.affectedRows > 0 ) {
                      console.log(results.message)
                  }
              }
            });
              console.log('No peers: '+ announceType)
            })
       })
       
       client.on('error', function (err) {
           parentPort.postMessage({error: err.message, posted: false});
           // aici daca nu e bun magnet-link-ul
           progress[0] = 1;
           progress[3] = 1

           let torr = {
            "torr_posted":progress[0],
            "torr_finish":progress[1],
            "torr_paused":progress[2],
            "torr_error":progress[3],
            "torr_mb_s":progress[4],
            "torr_progress":progress[5],
            "on_disk":progress[7],
            "torr_active":progress[8]
          }

           mysqlController.update('watchlist',torr,{"id": task.id},(error,results) => {
            if(error) {
                console.log(error);
            } else {
                if (results.affectedRows > 0 ) {
                    console.log(results.message)
                }
            }
          });
        })

        client.on('torrent', function (torrent) {
          console.log("on_torrent")
        })
}

