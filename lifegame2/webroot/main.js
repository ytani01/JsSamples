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
 * update
 */
const UPDATE_INTERVAL_BASE = 5; // msec
const UPDATE_INTERVAL_GENERATION = 100;
const UPDATE_INTERVAL_SHIFT = 150;
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
        //console.log(`id=${this.id}, [${this.x},${this.y}], [${this.right}, ${this.bottom}], ${this.w}x${this.h}, z=${this.z}`);

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
        //console.log(`id=${this.id}, [${this.x},${this.y}], ${this.w}x${this.h}, z=${this.z}`);
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
    "empty1": "./images/box1.png",
    "empty2": "./images/box1.png",
    "empty3": "./images/box1.png",
    "empty4": "./images/box1.png",
    "empty5": "./images/box1.png",
    "empty6": "./images/box1.png",
    "empty7": "./images/box1.png",
    "empty8": "./images/box1.png",
    "life":  "./images/life1.png",
    "life1":  "./images/life1.png",
    "life2":  "./images/life1.png",
    "life3":  "./images/life1.png",
    "life4":  "./images/life1.png",
    "life5":  "./images/life1.png",
    "life6":  "./images/life1.png",
    "life7":  "./images/life1.png",
    "life8":  "./images/life1.png",
    "new1":   "./images/new1.png",
    "new2":   "./images/new2.png",
    "new3":   "./images/new3.png",
    "new4":   "./images/new4.png",
    "new5":   "./images/life1.png",
    "new6":   "./images/life1.png",
    "new7":   "./images/life1.png",
    "new8":   "./images/life1.png",
    "death1": "./images/new4.png",
    "death2": "./images/new3.png",
    "death3": "./images/new2.png",
    "death4": "./images/new1.png",
    "death5": "./images/box1.png",
    "death6": "./images/box1.png",
    "death7": "./images/box1.png",
    "death8": "./images/box1.png"
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
                this.box[c][r] = new Box(id);
            } // for(r)
        } // for(c)

        this.shift = "";
        this.prev_msec_shift = 0;
        
        this.prev_msec_generation = 0;

        this.set_random();
    } // constructor

    /**
     *
     */
    set_random() {
        for (let r=0; r < Rows; r++) {
            for (let c=0; c < Cols; c++) {
                const id = `img-${c}-${r}`;
                this.box[c][r].set_stat("empty1");
                if ( Math.random() < 0.5 ) {
                    this.box[c][r].set_stat("life1");
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

                //
                // count neibors
                //
                let count = 0;
                for ( let d_r = -1; d_r <= 1; d_r++ ) {
                    for ( let d_c = -1; d_c <= 1; d_c++ ) {
                        const [c1, r1] = this.neibor_cr(c, r, d_c, d_r);
                        if ( c1 == c && r1 == r) {
                            continue;
                        }
                        if ( this.box[c1][r1].stat == "life" ) {
                            count++;
                        }
                    } // for(d_c)
                } // for(d_r)
                //console.log(`(${c},${r}): count=${count}`);

                //
                // change stat
                //
                if ( this.box[c][r].stat == "life" ) {
                    switch ( count ) {
                        case 0:
                        case 1:
                            this.box[c][r].next_stat = "death1";
                            break;
                        case 2:
                        case 3:
                            this.box[c][r].next_stat = "life1";
                            break;
                        default:
                            this.box[c][r].next_stat = "death1";
                            break;
                    } // switch(count)
                    continue;
                }
                if ( this.box[c][r].stat == "empty" ) {
                    this.box[c][r].next_stat = "empty1";
                    if ( count == 3 ) {
                        this.box[c][r].next_stat = "new1";
                    }
                    continue;
                }

                if ( this.box[c][r].stat == "new1" ) {
                    this.box[c][r].next_stat = "new2";
                    continue;
                }
                if ( this.box[c][r].stat == "death1" ) {
                    this.box[c][r].next_stat = "death2";
                    continue;
                }
                if ( this.box[c][r].stat == "life1" ) {
                    this.box[c][r].next_stat = "life2";
                    continue;
                }
                if ( this.box[c][r].stat == "empty1" ) {
                    this.box[c][r].next_stat = "empty2";
                    continue;
                }

                if ( this.box[c][r].stat == "new2" ) {
                    this.box[c][r].next_stat = "new3";
                    continue;
                }
                if ( this.box[c][r].stat == "death2" ) {
                    this.box[c][r].next_stat = "death3";
                    continue;
                }
                if ( this.box[c][r].stat == "life2" ) {
                    this.box[c][r].next_stat = "life3";
                    continue;
                }
                if ( this.box[c][r].stat == "empty2" ) {
                    this.box[c][r].next_stat = "empty3";
                    continue;
                }

                if ( this.box[c][r].stat == "new3" ) {
                    this.box[c][r].next_stat = "new4";
                    continue;
                }
                if ( this.box[c][r].stat == "death3" ) {
                    this.box[c][r].next_stat = "death4";
                    continue;
                }
                if ( this.box[c][r].stat == "life3" ) {
                    this.box[c][r].next_stat = "life4";
                    continue;
                }
                if ( this.box[c][r].stat == "empty3" ) {
                    this.box[c][r].next_stat = "empty4";
                    continue;
                }

                if ( this.box[c][r].stat == "new4" ) {
                    this.box[c][r].next_stat = "new5";
                    continue;
                }
                if ( this.box[c][r].stat == "death4" ) {
                    this.box[c][r].next_stat = "death5";
                    continue;
                }
                if ( this.box[c][r].stat == "life4" ) {
                    this.box[c][r].next_stat = "life5";
                    continue;
                }
                if ( this.box[c][r].stat == "empty4" ) {
                    this.box[c][r].next_stat = "empty5";
                    continue;
                }

                if ( this.box[c][r].stat == "new5" ) {
                    this.box[c][r].next_stat = "new6";
                    continue;
                }
                if ( this.box[c][r].stat == "death5" ) {
                    this.box[c][r].next_stat = "death6";
                    continue;
                }
                if ( this.box[c][r].stat == "life5" ) {
                    this.box[c][r].next_stat = "life6";
                    continue;
                }
                if ( this.box[c][r].stat == "empty5" ) {
                    this.box[c][r].next_stat = "empty6";
                    continue;
                }

                if ( this.box[c][r].stat == "new6" ) {
                    this.box[c][r].next_stat = "new7";
                    continue;
                }
                if ( this.box[c][r].stat == "death6" ) {
                    this.box[c][r].next_stat = "death7";
                    continue;
                }
                if ( this.box[c][r].stat == "life6" ) {
                    this.box[c][r].next_stat = "life7";
                    continue;
                }
                if ( this.box[c][r].stat == "empty6" ) {
                    this.box[c][r].next_stat = "empty7";
                    continue;
                }

                if ( this.box[c][r].stat == "new7" ) {
                    this.box[c][r].next_stat = "life";
                    continue;
                }
                if ( this.box[c][r].stat == "death7" ) {
                    this.box[c][r].next_stat = "empty";
                    continue;
                }
                if ( this.box[c][r].stat == "life7" ) {
                    this.box[c][r].next_stat = "life";
                    continue;
                }
                if ( this.box[c][r].stat == "empty7" ) {
                    this.box[c][r].next_stat = "empty";
                    continue;
                }

                if ( this.box[c][r].stat == "new8" ) {
                    this.box[c][r].next_stat = "life";
                    continue;
                }
                if ( this.box[c][r].stat == "death8" ) {
                    this.box[c][r].next_stat = "empty";
                    continue;
                }
                if ( this.box[c][r].stat == "life8" ) {
                    this.box[c][r].next_stat = "life";
                    continue;
                }
                if ( this.box[c][r].stat == "empty8" ) {
                    this.box[c][r].next_stat = "empty";
                    continue;
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
                //console.log(`(${c},${r}) ${this.box[c][r].stat}`);
            } // for(c)
        } // for(r)
    } // next_generation()

    /**
     *
     */
    shift_left(n=1) {
        for (let i=0; i < n; i++) {
            for (let r=0; r < Rows; r++) {
                const stat1 = this.box[0][r].stat;
                for (let c=0; c < Cols - 1; c++) {
                    this.box[c][r].set_stat(this.box[c+1][r].stat);
                }
                this.box[Cols - 1][r].set_stat(stat1);
            }
        }
    } // shift_left()

    /**
     *
     */
    shift_right(n=1) {
        for (let i=0; i < n; i++) {
            for (let r=0; r < Rows; r++) {
                const stat1 = this.box[Cols - 1][r].stat;
                for (let c=Cols - 1; c > 0; c--) {
                    this.box[c][r].set_stat(this.box[c-1][r].stat);
                }
                this.box[0][r].set_stat(stat1);
            }
        }
    } // shift_right()
    
    /**
     *
     */
    shift_up(n=1) {
        for (let i=0; i < n; i++) {
            for (let c=0; c < Cols; c++) {
                const stat1 = this.box[c][0].stat;
                for (let r=0; r < Rows - 1; r++) {
                    this.box[c][r].set_stat(this.box[c][r+1].stat);
                }
                this.box[c][Rows - 1].set_stat(stat1);
            }
        }
    } // shift_up()
    
    /**
     *
     */
    shift_down(n=1) {
        for (let i=0; i < n; i++) {
            for (let c=0; c < Cols; c++) {
                const stat1 = this.box[c][Rows - 1].stat;
                for (let r=Rows - 1; r > 0; r--) {
                    this.box[c][r].set_stat(this.box[c][r-1].stat);
                }
                this.box[c][0].set_stat(stat1);
            }
        }
    } // shift_down()
    
    /**
     *
     */
    update(cur_msec, cur_date_str) {
        if ( cur_msec - this.prev_msec_shift >= UPDATE_INTERVAL_SHIFT ) {
            if ( this.shift == "left") {
                this.shift_left();
            }
            if ( this.shift == "right") {
                this.shift_right();
            }
            if ( this.shift == "up") {
                this.shift_up();
            }
            if ( this.shift == "down") {
                this.shift_down();
            }
            this.prev_msec_shift = cur_msec;
        }
        if ( cur_msec - this.prev_msec_generation >= UPDATE_INTERVAL_GENERATION ) {
            this.next_generation();
            this.prev_msec_generation = cur_msec;
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

        if ( this.id == "button_left" ) {
            this.field.shift = "left";
        }
        if ( this.id == "button_right" ) {
            this.field.shift = "right";
        }
        if ( this.id == "button_up" ) {
            this.field.shift = "up";
        }
        if ( this.id == "button_down" ) {
            this.field.shift = "down";
        }
        //this.field.next_generation();
    } // on_mouse_down_xy()

    /**
     *
     */
    on_mouse_up_xy(x, y) {
        super.on_mouse_up_xy(x, y);

        this.field.shift = "";
    }
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
    
    const button_left = new AAA("button_left", field);
    const button_right = new AAA("button_right", field);
    const button_up = new AAA("button_up", field);
    const button_down = new AAA("button_down", field);

    setInterval(updateAll, UPDATE_INTERVAL_BASE);
}; // window.onload
