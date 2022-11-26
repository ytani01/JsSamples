//
// Copyright (c) 2022 Yoichi Tanibayashi
//
//////////
//
// # Inheritance Tree (is-a relationship)
//
// BaseObj
//   |
//   +- MoveableObj
//        |
//        +- MoveableImage
//             |
//             +- Ball1
//             |
//             +- Ball2
//
//////////

/**
 * update
 */
const UPDATE_INTERVAL_BASE = 33; // msec (30fps)
let UpdateObj = [];

/**
 *
 */
const updateAll = () => {
    const cur_date = new Date();
    const [
        cur_msec,
        cur_date_str
    ] = getDateInfo(cur_date);

    UpdateObj.forEach(obj => {
        obj.update(cur_msec, cur_date_str);
    });
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
    constructor(id) {
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
        
        UpdateObj.push(this);
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
        if ( x < this.x || x > this.x + this.w ) {
            return;
        }
        if ( y < this.y || y > this.y + this.h ) {
            return;
        }

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
class MoveableObj extends BaseObj {
    /**
     * @param {string} id
     * @param {number} x
     * @param {number} y
     */
    constructor(id, x, y) {
        super(id);

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
       
    update(cur_msec, cur_date_str) {
        if ( this.is_moving() ) {
            this.move(this.x + this.vx, this.y + this.vy);
        }

        if ( this.dst_up && this.y <= this.up ) {
            this.stop_move();
            this.move(this.x, this.dst_up);
        }
        if ( this.dst_down && this.y >= this.down ) {
            this.stop_move();
            this.move(this.x, this.dst_down);
        }
        if ( this.dst_left && this.x <= this.left ) {
            this.stop_move();
            this.move(this.dst_left, this.y);
        }
        if ( this.dst_right && this.x <= this.right ) {
            this.stop_move();
            this.move(this.dst_right, this.y);
        }
    } // update()
} // class MoveableObj


/**
 *
 */
class MoveableImage extends MoveableObj {
    constructor(id, x, y, center=false) {
        super(id, x, y);
        this.center = center;

        this.image_el = this.el.children[0];
        this.w = this.image_el.width;
        this.h = this.image_el.height;
        console.log(`id=${this.id}, [${this.x},${this.y}],${this.w}x${this.h},z=${this.z}`);

        if (center) {
            this.move_center(x, y);
        }
    } // constructor

    move_center(x, y) {
        const x1 = x - this.w / 2;
        const y1 = y - this.h / 2;
        this.move(x1, y1);
    } // move_center()
} // class MoveableImage

/**
 *
 */
class Ball1 extends MoveableImage {
    /**
     *
     */
    constructor(id, x, y, v) {
        super(id, x, y, true);

        this.v = v;
        this.vx = this.v;
        this.vy = this.v;
    } // constructor


    /**
     * @param {number} x
     * @param {number} y
     */
    on_mouse_down_xy(x, y) {
        super.on_mouse_down_xy(x, y);
        this.move_center(x, y);
    } // on_mouse_down()
    
    /**
     * @param {number} x
     * @param {number} y
     */
    on_mouse_up_xy(x, y) {
        super.on_mouse_up_xy(x, y);
    } // on_mouse_up_xy(x, y)

    /**
     * @param {number} x
     * @param {number} y
     */
    on_mouse_move_xy(x, y) {
        super.on_mouse_move_xy(x, y);
        if ( this.grabbed ) {
            this.move_center(x, y);
        }
    } // on_mouse_move_xy()
    
    /**
     * @param {number} cur_msec
     * @param {string} cur_date_str
     */
    update(cur_msec, cur_date_str) {
        if ( this.grabbed ) {
            return;
        }
        
        if ( this.x + this.w > document.body.scrollWidth ) {
            this.vx = -this.v;
        }
        if ( this.x < 0 ) {
            this.vx = this.v;
        }

        if ( this.y + this.h > document.body.scrollHeight ) {
            this.vy = -this.v;
        }
        if ( this.y < 0 ) {
            this.vy = this.v;
        }

        const center_x = this.x + this.vx + this.w / 2;
        const center_y = this.y + this.vy + this.h / 2;

        this.move_center(center_x, center_y);
    } // update()
} // class Ball1

/**
 * 
 */
class Ball2 extends MoveableImage {
    /**
     *
     */
    constructor (id, x, y) {
        super(id, x, y, true);
    } // constructor

    /**
     *
     */
    on_mouse_down_xy(x, y) {
        super.on_mouse_down_xy(x, y);
        this.move_center(x, y);
    } // on_mouse_down_xy()

    /**
     *
     */
    on_mouse_move_xy(x, y) {
        super.on_mouse_move_xy(x, y);
        if ( this.grabbed ) {
            this.move_center(x, y);
        }
    } // on_mouse_move_xy()

    /**
     *
     */
    update(cur_msec, cur_date_str) {
        if ( this.grabbed ) {
            return;
        }

        if ( this.x + this.w > document.body.scrollWidth && this.vx > 0) {
            this.vx = -this.vx;
        }
        if ( this.x < 0 && this.vx < 0 ) {
            this.vx = -this.vx;
        }
        if ( this.y + this.h > document.body.scrollHeight && this.vy > 0) {
            this.vy = -this.vy;
        }
        if ( this.y < 0 && this.vy < 0 ) {
            this.vy = -this.vy;
        }

        if ( this.is_moving() ) {
            this.move(this.x + this.vx, this.y + this.vy);
        }
    } // update()
} // class Ball2

/**
 *
 */
window.onload = () => {
    console.log(`window.onload()> start`);

    const text1 = new BaseObj("text1");
    const text2 = new BaseObj("text2");
    const ball1 = new Ball1("img1", 100, 50, 1);
    const ball2 = new Ball1("img2", 100, 100, 2);
    const ball3 = new Ball2("img3", 200, 100);
    ball3.start_move(3, 0.5);
    
    setInterval(updateAll, UPDATE_INTERVAL_BASE);
}; // window.onload
