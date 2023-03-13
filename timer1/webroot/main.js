//
// Timer
//

let UPDATE_INTERVAL = 500 // msec

let el_t_interval = document.getElementById("t_interval");
let el_t_remain = document.getElementById("t_remain");

let t_start = 0;
let t_interval = 0;

function updateAll() {
    if ( t_interval == 0 ) {
        return;
    }

    const t_now = (new Date().getTime()) / 1000;

    const t_remain = t_start + t_interval - t_now;
    console.log(`t_remain=${t_remain}`);

    el_t_remain.innerHTML = Math.floor(t_remain).toString();

    if ( t_remain <= 0 ) {
        el_t_remain.innerHTML = "時間だよ！";

        t_start = 0;
        t_interval = 0;
    }
}; // updateAll()


function start_timer() {
    t_interval = Number(el_t_interval.value);
    t_start = ((new Date()).getTime()) / 1000;
    console.log(`t_interval=${t_interval}, start:${t_start}`);
}; // on_start()

setInterval(updateAll, UPDATE_INTERVAL);
