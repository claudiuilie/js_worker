const { parentPort } = require('worker_threads');
const webtorrent = require('webtorrent')

parentPort.on('message', (task) => {

    var progress = new Int8Array(task.buff);
    downloadTorrent(task.magnet, progress)
    // parentPort.postMessage(task);
});


function downloadTorrent(magnet, progress){

    function prettyBytes(num){
         var exponent, unit, neg = num < 0, units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
         if (neg) num = -num
         if (num < 1) return (neg ? '-' : '') + num + ' B'
         exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1)
         num = Number((num / Math.pow(1000, exponent)).toFixed(2))
         unit = units[exponent]
         return (neg ? '-' : '') + num + ' ' + unit
     }

    
     let client = new webtorrent()

     client.add(magnet, { path: '/temp/' }, function (torrent) {

         let interval = setInterval(function () {

             progress[0] = 1;
             progress[2] = torrent.paused ? 1 : 0;
             progress[4] = parseInt(prettyBytes(torrent.downloadSpeed));
             progress[5] = parseInt(torrent.progress * 100);
             progress[6] = parseInt(torrent.numPeers);
             //active
             progress[8] = 1;

           console.log(prettyBytes(torrent.downloadSpeed) + '/s')
           console.log('Progress: ' + (torrent.progress * 100).toFixed(1) + '%')
           console.log('NumPeers: '+ torrent.numPeers)
           console.log('Paused: '+torrent.paused)
         }, 2000)
       
         torrent.on('done', function () {
            progress[1] = 1;
            progress[7] = 1;
            progress[8] = 0;
            progress[5] = 100;
           console.log('torrent download finished')
           clearInterval(interval)
         })
       
         torrent.on('ready', function () {console.log('Ready to use')})
         torrent.on('error', function (err) {
            progress[0] = 1;
            progress[3] = 1
            progress[8] = 0;
             console.log(err)
        })
         // torrent.on('warning', function (err) {console.log(err)})
         torrent.on('noPeers', function (announceType) {
            progress[0] = 1;
            progress[3] = 1;
              console.log('No peers: '+ announceType)
            })
       })
       
       client.on('error', function (err) {
           // aici daca nu e bun magnet-link-ul
           progress[0] = 1;
           progress[3] = 1
           console.log(err)
        })
}