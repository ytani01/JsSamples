//
// Copyright (c) 2022 Yoichi Tanibayashi
//
///////////////////////////////////////////
//
// # Inheritance Tree (is-a relationship)
//
// BaseObj
//   +- MoveableObj
//        +- MoveableImage
//
///////////////////////////////////////////

/**
 *
 */
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Base class
 */
class BaseObj {
    /**
     * @param {string} id string
     */
    constructor(id) {
        this.id = id;
        console.log(`${this.id}`);
        this.el = document.getElementById(this.id);

        const domRect = this.el.getBoundingClientRect();
        this.x = Math.floor(domRect.x);
        this.y = Math.floor(domRect.y);
        this.w = Math.floor(domRect.width);
        this.h = Math.floor(domRect.height);
        this.right = Math.floor(domRect.right);
        this.bottom = Math.floor(domRect.bottom);

        this.z = this.el.style.zIndex;
        if ( ! this.z ) {
            this.set_z(1);
        }
        console.log(`id=${this.id}, [${this.x},${this.y}]-[${this.right},${this.bottom}],${this.w}x${this.h},z=${this.z}`);
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
        console.log(`${this.id}> mouse_down(${x},${y})`);
        this.grabbed = true;
        this.el.style.zIndex = 100;
        return true;
    } // on_mouse_down()
    
    /**
     * @param {number} x
     * @param {number} y
     */
    on_mouse_up_xy(x, y) {
        // to be overridden
        console.log(`${this.id}> mouse_up(${x},${y})`);
        this.grabbed = false;
        this.el.style.zIndex = this.z;
        return true;
    } // on_mouse_up_xy(x, y)

    /**
     * @param {number} x
     * @param {number} y
     */
    on_mouse_move_xy(x, y) {
        // to be overridden
        if ( ! this.grabbed ) {
            return false;
        }
        //console.log(`${this.id}> mouse_move(${x},${y})`);
        return true;
    } // on_mouse_move_xy()

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
     * @param {number} sec
     */
    set_transition_duration(sec) {
        this.el.style.transitionTimingFunction = "linear";
        this.el.style.transitionDuration = sec + "s";
    } // set_transition_duration()

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
    constructor(id, x=undefined, y=undefined) {
        super(id);

        this.el.style.position = "absolute";

        if ( x === undefined || y === undefined ) {
            return;
        }
        this.move(x, y);
    } // constructor
} // class MyMoveable


/**
 *
 */
class MoveableImage extends MoveableObj {
    constructor(id, x=undefined, y=undefined, center=false) {
        super(id, x, y);
        this.center = center;

        this.image_el = this.el.children[0];
        this.w = this.image_el.width;
        this.h = this.image_el.height;
        console.log(`${this.id}> [${this.x},${this.y}],${this.w}x${this.h},z=${this.z}`);
        console.log(`${this.id}> src=${this.image_el.src}`);
        
        if (center) {
            this.move_center(x, y);
        }
    } // constructor

    /**
     * @param {number} x
     * @param {number} y
     */
    move_center(x, y) {
        const x1 = x - this.w / 2;
        const y1 = y - this.h / 2;
        this.move(x1, y1);
    } // move_center()

    /**
     * @param {string} image_file
     */
    set_img(image_file) {
        this.image_el.src = image_file;
    } // set_image()

    /**
     * @param {number} cur_msec
     * @param {string} cur_date_str
     */
    update(cur_msec, cur_date_str) {
        // to be overridden
    } // update()
} // class MoveableImage

const CONTENT = {
    "null":  "./images/empty.png",
    "red":   "./images/red.png",
    "green": "./images/green.png",
    "blue":  "./images/blue.png"
};

/**
 *
 */
class BackgroundImage extends BaseObj {
    /**
     *
     */
    constructor(id) {
        super(id);
    }
} // class BackgroundImage

/**
 *
 */
class Item extends MoveableImage {
    /**
     * @param {Board} board
     * @param {string} id
     */
    constructor(board, id) {
        super(id);

        this.board = board;
        
        this.content = undefined;
        this.set_content("null");

        this.box = undefined;
    } // constructor

    /**
     * @param {string} content_key
     */
    set_content(content_key) {
        this.content = content_key;
        this.image_el.src = CONTENT[this.content];
    } // set_content();

    /**
     * @param {number} x
     * @param {number} y
     */
    xy2colrow(x, y) {
    } // xy2colrow()

    /**
     *
     */
    on_mouse_down_xy(x, y) {
        super.on_mouse_down_xy(x, y);
    }

    /**
     *
     */
    on_mouse_up_xy(x, y) {
        super.on_mouse_up_xy(x, y);
        const [col, row] = this.board.get_colrow(x, y);
        const cur_box = this.box;
        if ( col >= 0 && col < this.board.cols &&
             row >= 0 && row < this.board.rows ) {
            // exchange items
            const dst_box = this.board.box[col][row];
            this.board.exchange_items(this.box, dst_box);
        } else {
            cur_box.put_item(this);
        }
    } // on_mouse_up_xy()

    /**
     *
     */
    on_mouse_move_xy(x, y) {
        if ( ! super.on_mouse_move_xy(x, y) ) {
            return;
        }

        this.move_center(x, y);
    }
} // class Item

/**
 *
 */
class Box {
    /**
     * @param {number} col
     * @param {number} row
     * @param {Item} item
     */
    constructor(board, col, row, item) {
        this.board = board;
        this.col = col;
        this.row = row;

        this.x = this.board.x + item.w * this.col + 1;
        this.y = this.board.y + item.h * this.row + 1;

        if ( item ) {
            this.put_item(item);
        }

        this.flag_remove = false;
    } // constructor

    /**
     *
     */
    put_item(item) {
        this.item = item;
        this.item.box = this;
        this.item.move(this.x, this.y);
    } // put_item()
} // class Box

/**
 *
 */
class Board extends MoveableImage {
    /**
     *
     */
    constructor(id, x, y) {
        super(id, x, y);
        
        this.cols = 6;
        this.rows = 6;

        // items
        this.item = [];
        for (let i=0; i < this.cols * this.rows; i++) {
            // create a item
            const item_id = `item${i}`;
            const item = new Item(this, item_id);

            // set item content
            const content_i = Math.floor(Math.random() * 3) + 1;
            const content_key = Object.keys(CONTENT)[content_i];
            item.set_content(content_key);

            // append item to item array
            this.item.push(item);
        } // for(i)

        // boxes
        let item_i = 0;
        this.box = new Array(this.cols);
        for (let c=0; c < this.cols; c++) {
            this.box[c] = new Array(this.rows);
            for (let r=0; r < this.rows; r++) {
                console.log(`[${c},${r}]`);

                // create box and put a item
                this.box[c][r] = new Box(this, c, r, this.item[item_i++]);
            } // for(r)
        } // for(c)
    } // constructor

    /**
     * @param {number} x
     * @param {number} y
     */
    get_colrow(x, y) {
        const col = Math.floor((x - this.x) / this.item[0].w);
        const row = Math.floor((y - this.y) / this.item[0].h);
        console.log(`(col,row)=(${col},${row})`);
        return [col, row];
    } // get_colrow()

    /**
     *
     */
    exchange_items(box1, box2) {
        const item1 = box1.item;
        const item2 = box2.item;

        item1.set_z(100);
        item2.set_z(100);

        box1.put_item(item2);
        box2.put_item(item1);

        item1.set_z(1);
        item2.set_z(1);

        this.check_and_do_action();
    } // exchange_items()

    /**
     *
     */
    check_and_do_action() {
        while (this.check_remove(3)) {
            this.do_remove();
            this.clear_flag_remove();
            
            while (this.down_items()) {
            }

            while ( this.add_new_items() ) {
                while (this.down_items()) {
                }

                /*
                if ( this.check_remove(3) ) {
                    this.do_remove();
                    this.clear_flag_remove();
                }
                */
            }
        }
    } // check_and_do_action()

    /**
     *
     */
    add_new_items() {
        let flag_add = false;
        for (let c=0; c < this.cols; c++) {
            const box = this.box[c][0];
            const content = box.item.content;
            if ( content == "null" ) {
                const content_i = Math.floor(Math.random() * 3) + 1;
                const content1 = Object.keys(CONTENT)[content_i];
                box.item.set_content(content1);
                flag_add = true;
                console.log(`(${c},0) ${content1}`);
            }
        } // for(c)
        return flag_add;
    } // add_new_items()

    /**
     *
     */
    down_items() {
        let flag_down = false;
        for (let r=this.rows-2; r >= 0; r--) {
            const r1 = r + 1;
            for (let c=0; c < this.cols; c++) {
                const box1 = this.box[c][r];
                if ( box1.item.content == "null" ) {
                    continue;
                }

                const box2 = this.box[c][r1];
                if ( box2.item.content == "null" ) {
                    this.exchange_items(box1, box2);

                    flag_down = true;
                    console.log(`${c},${r}->${r1}`);
                }
            } // for(c)
        } // for(r)
        return flag_down;
    } // down_items()

    /**
     *
     */
    clear_flag_remove() {
        for (let r=0; r < this.rows; r++) {
            for (let c=0; c < this.cols; c++) {
                this.box[c][r].item.flag_remove = false;
            } // for
        } // for
    } // clear_flag_remove()

    /**
     *
     */
    check_remove_right(col, row, n) {
        const content0 = this.box[col][row].item.content;
        if ( content0 == "null" ) {
            return 0;
        }
        
        // set `count`
        let count = 0;
        for (let c=col; c < this.cols; c++, count++) {
            const content1 = this.box[c][row].item.content;
            if ( content1 != content0 ) {
                break;
            }
        } // for(c,i)

        // set `flag_remove`
        if ( count >= n ) {
            for (let c=col, i=0; c < this.cols && i < count; c++, i++) {
                this.box[c][row].item.flag_remove = true;
            }
        }
        
        return count;
    } // check_remove_right()

    /**
     *
     */
    check_remove_down(col, row, n) {
        const content0 = this.box[col][row].item.content;

        if ( content0 == "null" ) {
            return 0;
        }

        // set continuous `count`
        let count = 0;
        for (let r=row; r < this.rows; r++, count++) {
            const content1 = this.box[col][r].item.content;
            if ( content1 != content0 ) {
                break;
            }
        } // for(c,i)

        // set `item.flag_remove`
        if ( count >= n ) {
            for (let r=row, i=0; r < this.rows && i < count; r++, i++) {
                this.box[col][r].item.flag_remove = true;
            }
        }
        
        return count;
    } // check_remove_down()

    /**
     *
     */
    check_remove(n) {
        let flag_remove = false;
        // check all
        for (let r=0; r < this.rows; r++) {
            for (let c=0; c < this.cols; c++) {
                if (this.check_remove_right(c, r, n) >= n) {
                    flag_remove = true;
                }
                if (this.check_remove_down(c, r, n) >= n) {
                    flag_remove = true;
                }
            } // for(c)
        } // for(r)
        return flag_remove;
    } // check_remove()

    /**
     *
     */
    do_remove() {
        for (let r=0; r < this.rows; r++) {
            for (let c=0; c < this.cols; c++) {
                if (this.box[c][r].item.flag_remove) {
                    this.box[c][r].item.set_content("null");
                }
            } // for(c)
        } // for(r)
    } // do_remove()
} // class Board

////////////////////

/**
 *
 */
const UPDATE_INTERVAL_BASE = 33; // msec (30fps)
let UpdateObj = [];
let PrevLap = 0;

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
} // getDateInfo()

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
 *
 */
window.onload = () => {
    console.log(`window.onload()> start`);

    bg_image = new BackgroundImage("bg_image");
    text1 = new MoveableObj("text1", bg_image.x, bg_image.y);
    board = new Board("board", bg_image.x + 50, bg_image.y + 25);
    
    setInterval(updateAll, UPDATE_INTERVAL_BASE);
}; // window.onload
