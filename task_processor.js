const { parentPort } = require('worker_threads');

parentPort.on('message', (task) => {

    var progress = new Int8Array(task);
    run(progress);
    // parentPort.postMessage(task);
});


// task that runs on thread
function run(arr){
    let x = 0;
    arr[1] = 12.2;

    let interval = setInterval(function()
    { x++
        arr[0] = x;
        arr[4] = x+2
        console.log("Cganged to : " + arr[0]);
        console.log(arr)
    }, 2000);
    // for (let k =0 ; k< task.b;k++){
    //     name = name+k
    // }
    // interval.
    if(x >15){
        parentPort.postMessage(task);
    }else{

    return 0;

    }
}