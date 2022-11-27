//
// Copyright (c) 2022 Yoichi Tanibayashi
//
//////////
//
// # Inheritance Tree (is-a relationship)
// |
// +- BaseObj
// |    |
// |    +- BaseImage
// |    |    |
// |    |    +- Box
// |    |
// |    +- MoveableObj
// |    |    |
// |    |    +- MoveableImage
// |    |
// |    +- AAA
// |    
// +- Field
//
// # has-a relationship
// |
// +- AAA
//      |
//      +- Field
//           |
//           +- Box
//
//////////

/**
 * mouse
 */
let MouseX = undefined;
let MouseY = undefined;
let PrevMouseX = undefined;
let PrevMouseY = undefined;

document.onpointermove = (e) => {
    MouseX = e.pageX;
    MouseY = e.pageY;
    console.log(`onpointermove> (${MouseX}, ${MouseY})`);
};

document.onpointerout = (e) => {
    MouseX = MouseY = undefined;
    console.log(`onpointerout> (${MouseX}, ${MouseY})`);
};

/**
 * update
 */
//const UPDATE_INTERVAL_BASE = 33; // msec (30fps)
const UPDATE_INTERVAL_BASE = 10; // msec
let UpdateObj = [];

const updateAll = () => {
    const dMouseX = MouseX - PrevMouseX;
    const dMouseY = MouseY - PrevMouseY;
    if ( MouseX !== undefined && MouseY !== undefined ) {
        if ( dMouseX != 0 || dMouseY != 0 ) {
            console.log(`dMouseXY: (${dMouseX}, ${dMouseY})`);
        }
    }

    const cur_date = new Date();
    const [
        cur_msec,
        cur_date_str
    ] = getDateInfo(cur_date);

    UpdateObj.forEach(obj => {
        obj.update(cur_msec, cur_date_str);
    });

    PrevMouseX = MouseX;
    PrevMouseY = MouseY;
}; // update_All()

/**
 * @param {Date} date
 */
const getDateInfo = (date) => {
    const msec = date.getTime();

    const yyyy_str = date.getFullYear().toString().padStart(4, '0');
    const mm_str = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd_str = date.getDate().toString().padStart(2, '0');

    const wday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const wday_str = wday[date.getDay()];

    const HH_str = date.getHours().toString().padStart(2, '0');
    const MM_str = date.getMinutes().toString().padStart(2, '0');
    const SS_str = date.getSeconds().toString().padStart(2, '0');

    const date_str = `${yyyy_str}/${mm_str}/${dd_str}(${wday_str}) ${HH_str}:${MM_str}:${SS_str}`;

    return [
        msec,
        date_str
    ];
}; // getDateInfo()

/**
 * Base class
 */
class BaseObj {
    /**
     * @param {string} id string
     */
    constructor(id, update=false) {
        this.id = id;
        this.el = document.getElementById(this.id);

        const domRect = this.el.getBoundingClientRect();
        this.x = Math.floor(domRect.x);
        this.y = Math.floor(domRect.y);
        this.w = Math.floor(domRect.width);
        this.h = Math.floor(domRect.height);
        this.right = Math.floor(domRect.right);
        this.bottom = Math.floor(domRect.bottom);

        this.z0 = this.el.style.zIndex;
        this.z = this.z0;
        if ( ! this.z ) {
            this.set_z(1);
        }
        console.log(`id=${this.id}, [${this.x},${this.y}],[${this.right},${this.bottom}],${this.w}x${this.h},z=${this.z}`);
        console.log(`innerHTML=${this.el.innerHTML}`);

        this.el.onmousedown = this.on_mouse_down.bind(this);
        this.el.ontouchstart = this.on_mouse_down.bind(this);
        this.el.onmouseup = this.on_mouse_up.bind(this);
        this.el.ontouchend = this.on_mouse_up.bind(this);
        this.el.onmousemove = this.on_mouse_move.bind(this);
        this.el.ontouchmove = this.on_mouse_move.bind(this);
        this.el.ondragstart = function() {
            return false;
        };

        this.grabbed = false;
        
        if ( update ) {
            UpdateObj.push(this);
        }
    } // BaseObj.constructor()
     
    /**
     *
     */
    isOn(x, y) {
        if ( x >= this.x && x <= (this.x + this.w) &&
             y >= this.y && y <= (this.y + this.h) ) {
            console.log(`${this.id}> isOn(${x},${y}): true`);
            return true;
        }
        return false;
    } // BaseObj.on()

    /**
     * @param {number} z
     */
    set_z(z) {
        this.z = z;
        this.el.style.zIndex = this.z;
    } // BaseObj.set_z()

    /**
     * @param {number} z (optional)
     */
    on(z=1) {
        this.el.style.opacity = 1;
        this.set_z(z);
    } // BaseObj.on()

    /**
     *
     */
    off() {
        this.el.style.opacity = 0;
        this.set_z(0);
    } // BaseObj.off()

    /**
     * @param {MouseEvent} e
     */
    touch2mouse(e) {
        e.preventDefault();
        if ( e.changedTouches ) {
            e = e.changedTouches[0];
        }
        return e;
    } // touch2mouse()

    /**
     * @param {MouseEvent} e
     */
    get_mouse_event_xy(e) {
        e = this.touch2mouse(e);
        return [Math.round(e.pageX), Math.round(e.pageY)];
    } // get_mouse_event_xy()

    /**
     * @param {MouseEvent} e
     */
    on_mouse_down(e) {
        let [x, y] = this.get_mouse_event_xy(e);
        /*
        if ( x < this.x || x > this.x + this.w ) {
            return;
        }
        if ( y < this.y || y > this.y + this.h ) {
            return;
        }
        */

        this.on_mouse_down_xy(x, y);
    } // on_mouse_down()

    /**
     * @param {MouseEvent} e
     */
    on_mouse_up(e) {
        let [x, y] = this.get_mouse_event_xy(e);
        this.on_mouse_up_xy(x, y);
    } // on_mouse_up()

    /**
     * @param {MouseEvent} e
     */
    on_mouse_move(e) {
        let [x, y] = this.get_mouse_event_xy(e);
        this.on_mouse_move_xy(x, y);
    } // on_mouse_move()

    /**
     * @param {number} x
     * @param {number} y
     */
    on_mouse_down_xy(x, y) {
        // to be overridden
        this.grabbed = true;
        this.set_z(100);
        console.log(`${this.id}> mouse_down_xy(${x},${y})`);
    } // on_mouse_down()
    
    /**
     * @param {number} x
     * @param {number} y
     */
    on_mouse_up_xy(x, y) {
        // to be overridden
        this.grabbed = false;
        this.set_z(this.z0);
        console.log(`${this.id}> mouse_up_xy(${x},${y})`);
    } // on_mouse_up_xy(x, y)

    /**
     * @param {number} x
     * @param {number} y
     */
    on_mouse_move_xy(x, y) {
        // to be overridden
        console.log(`${this.id}> mouse_move_xy(${x},${y})`);
    } // on_mouse_move_xy()

    /**
     * @param {number} current msec
     */
    update(cur_msec, cur_date_str) {
        // to be overridden
    } // BaseObj.update()

} // class BaseObj

/**
 *
 */
class BaseImage extends BaseObj {
    /**
     * @param {string} id
     */
    constructor(id, update=true) {
        super(id, update);

        this.image_el = this.el.children[0];
        this.w = this.image_el.width;
        this.h = this.image_el.height;
        console.log(`id=${this.id}, [${this.x},${this.y}],${this.w}x${this.h},z=${this.z}`);
    } // constructor

    /**
     *
     */
    set_img(img_path) {
        this.image_el.src = img_path;
    } // set_img()
    
} // class BaseImage

/**
 * 
 */
class MoveableObj extends BaseObj {
    /**
     * @param {string} id
     * @param {number} x
     * @param {number} y
     */
    constructor(id, x, y, update=true) {
        super(id, update);

        this.el.style.position = "absolute";

        this.vx = 0;
        this.vy = 0;

        this.dst_up = undefined;
        this.dst_down = undefined;
        this.dst_left = undefined;
        this.dst_right = undefined;
        
        this.move(x, y);
    } // constructor

    /**
     * @param {number} x
     * @param {number} y
     */
    move(x, y) {
        this.x = x;
        this.y = y;

        this.el.style.left = `${this.x}px`;
        this.el.style.top = `${this.y}px`;
    } // move()

    /**
     *
     */
    start_move(vx, vy) {
        this.vx = vx;
        this.vy = vy;
    } // start_move()

    /**
     *
     */
    stop_move() {
        this.vx = 0;
        this.vy = 0;
    } // stop()

    /**
     *
     */
    is_moving() {
        if ( this.vx != 0 || this.vy != 0 ) {
            return true;
        }
        return false;
    } // is_moving()
       
    /**
     *
     */
    on_mouse_up_xy(x, y) {
        super.on_mouse_up_xy(x, y);
        console.log(`vxy: (${this.vx}, ${this.vy})`);
    }

    update(cur_msec, cur_date_str) {
        if ( this.is_moving() ) {
            this.move(this.x + this.vx, this.y + this.vy);
        }

        if ( this.dst_up !== undefined && this.y <= this.up ) {
            this.stop_move();
            this.move(this.x, this.dst_up);
        }
        if ( this.dst_down !== undefined && this.y >= this.down ) {
            this.stop_move();
            this.move(this.x, this.dst_down);
        }
        if ( this.dst_left !== undefined && this.x <= this.left ) {
            this.stop_move();
            this.move(this.dst_left, this.y);
        }
        if ( this.dst_right !== undefined && this.x <= this.right ) {
            this.stop_move();
            this.move(this.dst_right, this.y);
        }
    } // update()
} // class MoveableObj

/**
 *
 */
class MoveableImage extends MoveableObj {
    constructor(id, x, y, center=false, update=true) {
        super(id, x, y, update);
        this.center = center;

        this.image_el = this.el.children[0];
        this.w = this.image_el.width;
        this.h = this.image_el.height;
        console.log(`id=${this.id}, [${this.x},${this.y}],${this.w}x${this.h},z=${this.z}`);

        if (center) {
            this.move_center(x, y);
        }
    } // constructor

    /**
     *
     */
    set_img(img_path) {
        this.image_el.src = img_path;
    } // set_img()

    /**
     * @param {number} x
     * @param {number} y
     */
    move_center(x, y) {
        const x1 = x - this.w / 2;
        const y1 = y - this.h / 2;
        this.move(x1, y1);
    } // move_center()
} // class MoveableImage

const IMG = {
    "empty": "./images/box1.png",
    "life":  "./images/life1.png",
    "new":   "./images/new1.png",
    "death": "./images/death1.png"
};

/**
 *
 */
class Box extends BaseImage {
    constructor(id, stat='empty', update=false) {
        super(id, update);

        this.stat = stat;
        this.set_stat(stat);
        this.next_stat = undefined;
    } // constructor

    /**
     *
     */
    set_stat(stat) {
        this.stat = stat;
        this.set_img(IMG[stat]);
    } // set_stat()
} // class Box

const UPDATE_INTERVAL_GENERATION = 500;

/**
 *
 */
class Field {
    /**
     *
     */
    constructor(cols, rows) {
        this.box = [];
        for (let c=0; c < Cols; c++) {
            this.box[c] = [];
            for (let r=0; r < Rows; r++) {
                const id = `img-${c}-${r}`;
                this.box[c][r] = new Box(id, "empty");
            } // for(r)
        } // for(c)

        this.prev_msec = 0;
        
        this.set_random();
    } // constructor

    /**
     *
     */
    set_random() {
        console.log(`${this.id}:set_random> `);
        for (let r=0; r < Rows; r++) {
            for (let c=0; c < Cols; c++) {
                const id = `img-${c}-${r}`;
                this.box[c][r].set_stat("empty");
                if ( Math.random() < 0.5 ) {
                    this.box[c][r].set_stat("new");
                }
            } // for(c)
        } // for(r)
    } // set_random()

    /**
     *
     */
    neibor_cr(c, r, d_c, d_r) {
        c += d_c;
        r += d_r;

        if ( c < 0 ) {
            c = Cols - 1;
        }
        if ( c > Cols - 1 ) {
            c = 0;
        }
        if ( r < 0 ) {
            r = Rows - 1;
        }
        if ( r > Rows - 1 ) {
            r = 0;
        }
        return [c, r];
    }

    /**
     *
     */
    set_next_stats() {
        for (let r=0; r < Rows; r++) {
            for (let c=0; c < Cols; c++) {
                let count = 0;
                for ( let d_r = -1; d_r <= 1; d_r++ ) {
                    for ( let d_c = -1; d_c <= 1; d_c++ ) {
                        const [c1, r1] = this.neibor_cr(c, r, d_c, d_r);
                        if ( c1 == c && r1 == r) {
                            continue;
                        }
                        if ( this.box[c1][r1].stat == "life" ||
                             this.box[c1][r1].stat == "new" ) {
                            count++;
                        }
                    } // for(d_c)
                } // for(d_r)
                //console.log(`(${c},${r}): count=${count}`);

                if ( this.box[c][r].stat == "life" ||
                     this.box[c][r].stat == "new" ) {
                    switch ( count ) {
                        case 0:
                        case 1:
                            this.box[c][r].next_stat = "death";
                            break;
                        case 2:
                        case 3:
                            this.box[c][r].next_stat = "life";
                            break;
                        default:
                            this.box[c][r].next_stat = "death";
                            break;
                    } // switch(count)
                } else {
                    this.box[c][r].next_stat = "empty";
                    if ( count == 3 ) {
                        this.box[c][r].next_stat = "new";
                    }
                }
            } // for(c)
        } // for(r)
    } // set_next_stats()

    /**
     *
     */
    next_generation() {
        this.set_next_stats();

        for (let r=0; r < Rows; r++) {
            for (let c=0; c < Cols; c++) {
                this.box[c][r].set_stat(this.box[c][r].next_stat);
            } // for(c)
        } // for(r)
    } // next_generation()

    /**
     *
     */
    update(cur_msec, cur_date_str) {
        if (cur_msec - this.prev_msec >= UPDATE_INTERVAL_GENERATION) {
            this.next_generation();
            this.prev_msec = cur_msec;
        }
    } // update()
} // class Field

/**
 *
 */
class AAA extends BaseObj {
    constructor(id, field) {
        super(id);

        this.field = field;
    }

    /**
     *
     */
    on_mouse_down_xy(x, y) {
        super.on_mouse_down_xy(x, y);

        this.field.next_generation();
    } // on_mouse_down_xy()
} // class AAA


//const Cols = 10;
//const Rows = 20;

/**
 *
 */
window.onload = () => {
    console.log(`window.onload()> start`);

    const field = new Field(Cols, Rows);
    UpdateObj.push(field);
    
    const title = new AAA("title", field);
    const aaa = new AAA("aaa", field);
    const zzz = new AAA("zzz", field);

    setInterval(updateAll, UPDATE_INTERVAL_BASE);
}; // window.onload
