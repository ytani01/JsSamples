//
// Timer
//
const UPDATE_INTERVAL = 100; // msec

const el_clock_hand1 = document.getElementById("clock_hand1");
const el_clock_hand2 = document.getElementById("clock_hand2");
const el_t_limit = document.getElementById("t_limit");
const el_t_remain = document.getElementById("t_remain");

let t_start = 0; // スタート時刻
let t_end = 0; // 終了時刻
let t_limit = 0; // 0のとき、タイマーは止まっている

function updateAll() {
    if ( t_limit == 0 ) {
        // タイマーが止まっているときは、以下の処理はせずにリターン
        return;
    }

    const t_now = (new Date().getTime()) / 1000; // 現在時刻

    const t_remain = t_end - t_now; // 残り時間
    console.log(`t_remain=${t_remain}`);

    el_t_remain.innerHTML = Math.round(t_remain).toString() + " 秒"; // 残り時間表示

    // 針の回転
    const remain_min = t_remain / 60;
    const remain_sec = Math.round(t_remain % 60); // 四捨五入
    console.log(`${remain_min}:${remain_sec}`);

    const clock_hand1_deg = remain_sec * (360 / 60);
    const clock_hand2_deg = remain_min * (360 / 60);
    

    el_clock_hand1.style.transform = `rotate(${clock_hand1_deg}deg)`;
    el_clock_hand2.style.transform = `rotate(${clock_hand2_deg}deg)`;

    // タイムリミット
    if ( t_remain <= 0 ) {
        el_t_remain.innerHTML = "時間だよ！";

        t_start = 0;
        t_limit = 0;
    }
}; // updateAll()


function start_timer() {
    t_limit = Number(el_t_limit.value); // 時間を取得
    t_start = ((new Date()).getTime()) / 1000; // スタート時刻(秒)
    t_end = t_start + t_limit; // 終了時刻
    console.log(`t_limit=${t_limit}, start:${t_start}`);
}; // on_start()

setInterval(updateAll, UPDATE_INTERVAL);
