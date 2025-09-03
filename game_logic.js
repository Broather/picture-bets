import { contains_alphanum, Random, range } from "./utility.js"

const AR = {
    SIXL: 5,
    CORNER: 8,
    STREET: 11,
    SPLIT: 17,
    SU: 35
}
const POSITION = {
    ZERO: "ZERO",
    ZERO_TOP: "ZERO_TOP",
    ZERO_MID: "ZERO_MID",
    ZERO_BOT: "ZERO_BOT",
    CENTER_TOP: "CENTER_TOP",
    CENTER_MID: "CENTER_MID",
    CENTER_BOT: "CENTER_BOT",
    COLUMN_TOP: "COLUMN_TOP",
    COLUMN_MID: "COLUMN_MID",
    COLUMN_BOT: "COLUMN_BOT"
}
const DIRECTION = {
    UP: "UP",
    DOWN: "DOWN",
    LEFT: "LEFT",
    RIGHT: "RIGHT",
    TOWARDS_USER: "TOWARDS_USER",
    TOP_RIGHT: "TOP_RIGHT",
    TOP_LEFT: "TOP_LEFT",
    BOTTOM_RIGHT: "BOTTOM_RIGHT",
    BOTTOM_LEFT: "BOTTOM_LEFT",
}
const PICTURE_BETS = {
    pbs: {
        // single
        "5": [AR.SIXL],
        "8": [AR.CORNER],
        "11": [AR.STREET],
        "17": [AR.SPLIT],
        "35": [AR.SU],
        // small
        "25": [AR.SPLIT, AR.CORNER],
        "33": [AR.CORNER, AR.SPLIT, AR.CORNER],
        "21": [AR.SIXL, AR.STREET, AR.SIXL],
        "60": [AR.SU, AR.SPLIT, AR.CORNER],
        "52": [AR.SU, AR.SPLIT],
        "51": [AR.CORNER, AR.SU, AR.CORNER],
        "43": [AR.SU, AR.CORNER],
        "69": [AR.SU, AR.SPLIT, AR.SPLIT],
        // medium
        "77": [AR.SPLIT, AR.SU, AR.CORNER, AR.SPLIT],
        "88": [AR.CORNER, AR.SPLIT, AR.CORNER, AR.SPLIT, AR.SPLIT, AR.SIXL, AR.STREET, AR.SIXL],
        "100": [AR.SPLIT, AR.SPLIT, AR.SPLIT, AR.SPLIT, AR.CORNER, AR.CORNER, AR.CORNER, AR.CORNER],
        "86": [AR.SU, AR.SPLIT, AR.SPLIT, AR.SPLIT],
        "67": [AR.CORNER, AR.CORNER, AR.CORNER, AR.CORNER, AR.SU],
        "103": [AR.SU, AR.SPLIT, AR.SPLIT, AR.SPLIT, AR.SPLIT],
        "102": [AR.SU, AR.SPLIT, AR.SPLIT, AR.SPLIT, AR.CORNER, AR.CORNER],
        // large
        "135": [AR.SU, AR.SPLIT, AR.SPLIT, AR.SPLIT, AR.SPLIT, AR.CORNER, AR.CORNER, AR.CORNER, AR.CORNER],
        "165": [AR.SU, AR.SPLIT, AR.SPLIT, AR.SPLIT, AR.SPLIT, AR.STREET, AR.STREET, AR.STREET, AR.CORNER, AR.CORNER, AR.CORNER, AR.SIXL]
    },
    get(...keys) {
        return keys.flatMap((key) => this.pbs[key] || [])
    }
}

class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.position = null
    }
    // counts how many references of `this` array contains
    count(array) {
        return array.filter((p) => p == this).length
    }
    set_position(position) {
        this.position = position
    }
    add(value) {
        this.x += value
        this.y += value
        return this
    }
    static multiple_set_position(array, ...values) {
        console.assert(array.length >= values.length,
            `in multiple_set_positions: too many values given. Array has ${array.length}, gave ${values.length}`)
        for (let i = 0; i < array.length; i++) {
            array[i].set_position(values[i])
        }
    }
}
class Rectangle {
    constructor(x, y, width, height, number = null) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.number = number
        this.padding = Rectangle.current_style.padding
        this.style = Rectangle.current_style.style.substring(0)

    }
    get tl() { return new Point(this.x, this.y) }
    get tl_w_padding() { return new Point(this.x + this.padding, this.y + this.padding) }
    get br() { return new Point(this.x + this.width, this.y + this.height) }
    get br_w_padding() { return new Point(this.x + this.width - this.padding, this.y + this.height - this.padding) }
    get center() { return new Point(this.x + this.width / 2, this.y + this.height / 2) }
    ctrl_cv(direction, changes = {}) {
        // new coordinates and difference from old number to new
        let x, y, d_number
        switch (direction) {
            case DIRECTION.UP:
                x = this.x
                y = this.y - this.height
                d_number = - 1
                break
            case DIRECTION.DOWN:
                x = this.x
                y = this.y + this.height
                d_number = + 1
                break
            case DIRECTION.LEFT:
                x = this.x - this.width
                y = this.y
                d_number = + 3
                break
            case DIRECTION.RIGHT:
                x = this.x + this.width
                y = this.y
                d_number = - 3
                break
            case DIRECTION.TOWARDS_USER:
                x = this.x
                y = this.y
                d_number = 0
            default:
                console.assert(false, "ERROR: unrecognised direction")
                break
        }
        const dx = changes.dx !== undefined ? changes.dx : 0
        const dy = changes.dy !== undefined ? changes.dy : 0

        return new Rectangle(
            changes.x !== undefined ? changes.x + dx : x + dx,
            changes.y !== undefined ? changes.y + dy : y + dy,
            changes.width !== undefined ? changes.width : this.width,
            changes.height !== undefined ? changes.height : this.height,
            changes.number !== undefined ? changes.number : contains_alphanum(this.number) ? this.number : this.number + d_number,
        )
    }
    // for quickly making `count` Rectangles
    array(direction, count) {
        const result = [this]
        for (let i = 0; i < count - 1; i++) {
            let last = result[result.length - 1]
            result.push(last.ctrl_cv(direction))
        }
        return result
    }
    overlap(...target_rectangles) {
        const bounding_box = Rectangle.bounding_box(...target_rectangles)
        this.x = bounding_box.x
        this.y = bounding_box.y
        this.width = bounding_box.width
        this.height = bounding_box.height
    }
    to_svg_rect() {
        return Object.assign({
            x: this.x + (this.padding ? this.padding : 0),
            y: this.y + (this.padding ? this.padding : 0),
            width: this.width - (this.padding ? 2 * this.padding : 0),
            height: this.height - (this.padding ? 2 * this.padding : 0),
        }, this.style ? { style: this.style } : {})
    }
    to_svg_text() {
        const roulette_number_order = [32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26]
        // TODO: define missing texture repeating pattern and use url of that
        let color = "purple"
        const parsed_number = parseInt(this.number)
        if (parsed_number == 0) {
            color = "green"
        } else if (roulette_number_order.includes(parsed_number)) {
            if (roulette_number_order.indexOf(parsed_number) % 2 == 0) {
                color = "red"
            } else {
                color = "black"
            }
        }
        return {
            class: contains_alphanum(this.number) ? "column" : "layout",
            x: this.center.x,
            y: this.center.y,
            "transform": `rotate(90, ${this.center.x}, ${this.center.y})`,
            fill: color
        }
    }
    static current_style = { style: "", padding: 0 }
    static set_style(style_str) {
        Rectangle.current_style.style = style_str
    }
    static set_padding(padding) {
        Rectangle.current_style.padding = padding
    }
    static reset_style() {
        Rectangle.current_style.style = ""
    }
    static reset_padding() {
        Rectangle.current_style.padding = 0
    }
    // modifies `zero_rectangle`s to_svg_rect function to have the parameters of a polygon type element
    static extend_zero_area(zero_r) {
        const points = [
            `${zero_r.tl.x + zero_r.padding},${zero_r.tl.y - zero_r.height + zero_r.padding}`,
            `${zero_r.center.x - zero_r.padding},${zero_r.tl.y - zero_r.height + zero_r.padding}`,
            `${zero_r.br.x - zero_r.padding},${zero_r.center.y}`,
            `${zero_r.center.x - zero_r.padding},${zero_r.br.y + zero_r.height - zero_r.padding}`,
            `${zero_r.tl.x + zero_r.padding},${zero_r.br.y + zero_r.height - zero_r.padding}`,
        ]
        // new origin is moved up by height
        zero_r.y -= zero_r.height
        // new height is trippled
        zero_r.height *= 3
        // new width is halved
        zero_r.width /= 2

        zero_r.to_svg_rect = () => {
            return Object.assign({
                points: points.join(" ")
            }, zero_r.style ? { style: zero_r.style } : {})
        }
        // NOTE: this is sick
        Object.defineProperty(zero_r, "center", {
            get() {
                return new Point(zero_r.x + zero_r.width, zero_r.y + zero_r.height / 2)
            }
        })
        return zero_r
    }
    static extend_background(bg, left_filler, right_filler) {
        if (left_filler.length != undefined) {
            left_filler = left_filler[0]
        }
        if (right_filler.length != undefined) {
            right_filler = right_filler[0]
        }
        const points = [
            `${bg.tl.x},${bg.tl.y + bg.padding}`,
            `${bg.br.x},${bg.tl.y + bg.padding}`,
            `${bg.br.x + right_filler.width - bg.padding},${bg.tl.y + bg.padding}`,
            `${bg.br.x + bg.width - bg.padding},${bg.center.y}`,
            `${bg.br.x + right_filler.width - bg.padding},${bg.br.y - bg.padding}`,
            `${bg.br.x},${bg.br.y - bg.padding}`,
            `${bg.tl.x},${bg.br.y - bg.padding}`,
            `${bg.tl.x - left_filler.width + bg.padding},${bg.br.y - bg.padding}`,
            `${bg.tl.x - bg.width + bg.padding},${bg.center.y}`,
            `${bg.tl.x - left_filler.width + bg.padding},${bg.tl.y + bg.padding}`,
        ]
        // NOTE: I have an if statement 
        // that interprets a rectangle as a polygon if number == 0
        bg.number = 0
        bg.to_svg_rect = () => {
            return Object.assign({
                points: points.join(" ")
            }, bg.style ? { style: bg.style } : {})
        }
    }
    static extend_header(header, left_filler, right_filler) {
        if (left_filler.length != undefined) {
            left_filler = left_filler[0]
        }
        if (right_filler.length != undefined) {
            right_filler = right_filler[0]
        }

        function is_column_filler(filler) {
            return contains_alphanum(filler.number)
        }
        // NOTE: header does not overlap column filler, 
        // so interpret it's width as 0 
        const left_filler_width = left_filler.width * !is_column_filler(left_filler)
        header.x = header.x - left_filler_width
        header.width = left_filler_width + header.width + right_filler.width
    }
    static bounding_box(...rectangles) {
        // ** GPT 4o generated code **
        // Initialize bounding box values
        let min_x = Infinity, min_y = Infinity;
        let max_x = -Infinity, max_y = -Infinity;

        // Find the bounding box that contains all rectangles
        for (const rect of rectangles) {
            min_x = Math.min(min_x, rect.tl.x);
            min_y = Math.min(min_y, rect.tl.y);
            max_x = Math.max(max_x, rect.br.x);
            max_y = Math.max(max_y, rect.br.y);
        }
        return new Rectangle(min_x, min_y, max_x - min_x, max_y - min_y)
    }
    // returns a Rectangle object that overlaps all `rectangles`
    // and has a gradient to `direction` going from transparent to background_color
    static create_gradient(direction, rectangles) {
        const bounding_box = Rectangle.bounding_box(...rectangles)
        const toppest_of_left = bounding_box.tl;
        const bottomest_of_right = bounding_box.br;

        const previous_style = Rectangle.current_style.style.substring(0)
        switch (direction) {
            case DIRECTION.LEFT:
                Rectangle.set_style("fill: url(#to_left); stroke: none")
                break;
            case DIRECTION.RIGHT:
                Rectangle.set_style("fill: url(#to_right); stroke: none")
                break;

            default:
                console.assert(false, `ERROR: Rectangle.gradient only supports LEFT or RIGHT directions, given ${direction}`)
                break;
        }

        const result = new Rectangle(toppest_of_left.x, toppest_of_left.y,
            Math.abs(bottomest_of_right.x - toppest_of_left.x), Math.abs(bottomest_of_right.y - toppest_of_left.y))
        Rectangle.set_style(previous_style)
        return result
    }
}
class Stack {
    static chip_radius = 1
    static chip_diameter = 2
    constructor(x, y, count) {
        this.x = x
        this.y = y
        this.count = count
    }
    add(value) {
        this.count += value
    }
    ctrl_cv(direction, changes = {}) {
        // TODO: add diagonal directions
        let x, y
        switch (direction) {
            case DIRECTION.UP:
                x = this.x
                y = this.y - Stack.chip_diameter
                break
            case DIRECTION.DOWN:
                x = this.x
                y = this.y + Stack.chip_diameter
                break
            case DIRECTION.LEFT:
                x = this.x - Stack.chip_diameter
                y = this.y
                break
            case DIRECTION.RIGHT:
                x = this.x + Stack.chip_diameter
                y = this.y
                break
            case DIRECTION.TOWARDS_USER:
                x = this.x
                y = this.y
                break
            case DIRECTION.TOP_RIGHT:
                x = this.x + Stack.chip_radius
                y = this.y - .85 * Stack.chip_diameter
                break
            case DIRECTION.TOP_LEFT:
                x = this.x - Stack.chip_radius
                y = this.y - .85 * Stack.chip_diameter
                break
            case DIRECTION.BOTTOM_RIGHT:
                x = this.x + Stack.chip_radius
                y = this.y + .85 * Stack.chip_diameter
                break
            case DIRECTION.BOTTOM_LEFT:
                x = this.x - Stack.chip_radius
                y = this.y + .85 * Stack.chip_diameter
                break
            default:
                console.assert(false, "ERROR: unrecognised direction")
                break
        }
        const dx = changes.dx !== undefined ? changes.dx : 0
        const dy = changes.dy !== undefined ? changes.dy : 0

        return new Stack(
            changes.x !== undefined ? changes.x + dx : x + dx,
            changes.y !== undefined ? changes.y + dy : y + dy,
            changes.count !== undefined ? changes.count : this.count,
        )
    }
    array(direction, count) {
        const result = [this]
        for (let i = 0; i < count - 1; i++) {
            let last = result[result.length - 1]
            result.push(last.ctrl_cv(direction))
        }
        return result
    }
    realise() {
        const p = new Point(this.x, this.y)
        return Array.from({ length: this.count }, (_) => p)
    }
}
class TempView {
    constructor(payout) {
        const chip_radius = 1
        const chip_diameter = chip_radius * 2

        this.rectangles = []
        this.chips = []
        let stacks_count, addi_count, wipe_count
        [stacks_count, addi_count, wipe_count] = this.payout_to_layout(payout)

        Rectangle.set_padding(chip_radius)
        // stacks
        const stack_footprint = new Rectangle(0, chip_diameter * 9, chip_diameter * 4, chip_diameter * 4)
        const stacks = this.layout_stacks(stack_footprint, stacks_count)

        if (stacks.length > 0) {
            function y_asc_x_desc(a, b) {
                if (a.y == b.y) {
                    return b.x - a.x
                }
                return a.y - b.y
            }
            // primarily sorts by y ascending, if same y: sorts by x descending
            const wipe_stack = stacks.toSorted(y_asc_x_desc)[0]
            wipe_stack.add(-wipe_count)
        }

        this.chips = stacks.flatMap((s) => s.realise())
        const additional = stack_footprint.ctrl_cv(DIRECTION.RIGHT, { dx: chip_diameter })
        // this.chips = this.chips.concat(View.generate_matrix(additional.tl_w_padding, additional.br_w_padding, 4, 4))
        const wipe = additional.ctrl_cv(DIRECTION.RIGHT, { dx: chip_diameter * 2, width: chip_diameter * 3, height: chip_diameter * 3 })
        // this.chips = this.chips.concat(View.generate_matrix(wipe.tl_w_padding, wipe.br_w_padding, 3, 3))
    }
    payout_to_layout(payout) {
        const stacks = Math.floor(payout / 20) + (payout % 20 >= 14 ? 1 : 0)
        const additional = payout % 20 <= 13 ? payout % 20 : 0
        const wipe = payout % 20 >= 14 ? 20 - payout % 20 : 0
        // console.log([stacks, additional, wipe])
        return [stacks, additional, wipe]
    }
    layout_stacks(footprint, count) {
        const result = []
        // used by 1 and 2
        const center = new Stack(footprint.center.x, footprint.center.y, 20)
        // used by 3,4,5,6
        const bottom = center.ctrl_cv(DIRECTION.DOWN, { dy: -Stack.chip_radius })
        const right = bottom.ctrl_cv(DIRECTION.TOP_RIGHT)
        // used by 7 and 8
        const directions = [DIRECTION.TOWARDS_USER, DIRECTION.TOP_LEFT, DIRECTION.TOP_RIGHT, DIRECTION.RIGHT, DIRECTION.BOTTOM_RIGHT, DIRECTION.BOTTOM_LEFT, DIRECTION.LEFT]
        // used by 9 and 10
        const bottom_leftest = center.ctrl_cv(DIRECTION.BOTTOM_LEFT, { dx: -Stack.chip_diameter })
        let left_side
        switch (count) {
            case 1:
                result.push(center)
                break
            case 2:
                result.push(...bottom.array(DIRECTION.UP, 2))
                break
            case 3:
                result.push(bottom, bottom.ctrl_cv(DIRECTION.TOP_LEFT), bottom.ctrl_cv(DIRECTION.TOP_RIGHT))
                break
            case 4:
                result.push(...bottom.array(DIRECTION.TOP_LEFT, 2), ...right.array(DIRECTION.TOP_LEFT, 2))
                break
            case 5:
                result.push(...bottom.array(DIRECTION.TOP_LEFT, 3), ...right.array(DIRECTION.TOP_LEFT, 2))
                break
            case 6:
                result.push(...bottom.array(DIRECTION.TOP_LEFT, 3), ...right.array(DIRECTION.TOP_LEFT, 3))
                break
            case 7:
                directions.map((d) => result.push(center.ctrl_cv(d)))
                break
            case 8:
                result.push(...center.ctrl_cv(DIRECTION.TOP_RIGHT).array(DIRECTION.TOP_LEFT, 2))
                directions.map((d) => { if (d !== DIRECTION.TOP_RIGHT) result.push(center.ctrl_cv(d)) })
                break
            case 9:
                left_side = bottom_leftest.array(DIRECTION.TOP_RIGHT, 3)
                for (let i = 0; i < left_side.length; i++) {
                    result.push(...left_side[i].array(DIRECTION.RIGHT, 4 - i))
                }
                break
            case 10:
                left_side = bottom_leftest.array(DIRECTION.TOP_RIGHT, 4)
                for (let i = 0; i < left_side.length; i++) {
                    result.push(...left_side[i].array(DIRECTION.RIGHT, 4 - i))
                }
                break
            default:
                break;
        }
        return result
    }
}
class View {
    constructor(bets, position_type, chip_placing_fn) {
        const gap = .15
        Rectangle.set_style("fill: tan")
        Rectangle.set_padding(-gap)
        const background = new Rectangle(0, 0, 0, 0)
        const header_background = new Rectangle(0, 0, 0, 0)
        Rectangle.set_style("fill: wheat")
        Rectangle.set_padding(gap)
        const header = new Rectangle(6, -1 - gap * 4, 4, 2)
        // TODO: I only care about the column (column, center, zero) a position belongs to
        const top_number = {
            [POSITION.ZERO]: 1,
            [POSITION.ZERO_TOP]: 1,
            [POSITION.ZERO_MID]: 1,
            [POSITION.ZERO_BOT]: 1,
            [POSITION.CENTER_TOP]: Random.pick_one(range(4, 31 + 1, 3)),
            [POSITION.CENTER_MID]: Random.pick_one(range(4, 31 + 1, 3)),
            [POSITION.CENTER_BOT]: Random.pick_one(range(4, 31 + 1, 3)),
            [POSITION.COLUMN_TOP]: 34,
            [POSITION.COLUMN_MID]: 34,
            [POSITION.COLUMN_BOT]: 34
        }[position_type]
        const top = header.ctrl_cv(DIRECTION.DOWN, { y: 1, height: 5, number: top_number })
        const middle = top.ctrl_cv(DIRECTION.DOWN)
        const bottom = middle.ctrl_cv(DIRECTION.DOWN)
        // NOTE: intermediary state to at least wrap around the middle boxes
        background.overlap(top, middle, bottom)
        const zero = Rectangle.extend_zero_area(middle.ctrl_cv(DIRECTION.RIGHT, { number: 0 }))

        const base_rectangles = [background, header_background, header, top, middle, bottom]
        // TODO: I only care about the row (TOP, MID, BOT) a position belongs to
        const winning_square = {
            [POSITION.ZERO]: zero,
            [POSITION.ZERO_TOP]: top,
            [POSITION.ZERO_MID]: middle,
            [POSITION.ZERO_BOT]: bottom,
            [POSITION.CENTER_TOP]: top,
            [POSITION.CENTER_MID]: middle,
            [POSITION.CENTER_BOT]: bottom,
            [POSITION.COLUMN_TOP]: top,
            [POSITION.COLUMN_MID]: middle,
            [POSITION.COLUMN_BOT]: bottom
        }[position_type]

        this.base_coordinate_matrix = position_type == POSITION.ZERO ?
            View.generate_matrix(zero.tl, zero.br, 7, 3) : View.generate_matrix(top.tl, bottom.br, 7, 3)

        function is_within_winning_square(point) { return winning_square.tl.y <= point.y && point.y <= winning_square.br.y }
        function not_on_bottom_row(point) { return point.y != bottom.br.y }
        this.coordinate_matrix = this.base_coordinate_matrix.filter((point) => point.y == top.tl.y ||
            is_within_winning_square(point) && not_on_bottom_row(point))

        this.chips = []
        let left_filler = null
        let right_filler = null
        if ([POSITION.CENTER_TOP, POSITION.CENTER_MID, POSITION.CENTER_BOT].includes(position_type)) {
            left_filler = top.ctrl_cv(DIRECTION.LEFT).array(DIRECTION.DOWN, 3)
            right_filler = top.ctrl_cv(DIRECTION.RIGHT).array(DIRECTION.DOWN, 3)
            this.rectangles = base_rectangles.concat(left_filler, right_filler,
                // TODO: revisit focus guiding another time
                // [Rectangle.create_gradient(DIRECTION.LEFT, left_filler), Rectangle.create_gradient(DIRECTION.RIGHT, right_filler)]
            )

            // top row is always SIXL, STREET, SIXL
            const top_row = this.coordinate_matrix.filter((p) => p.y == top.tl.y)
            Point.multiple_set_position(top_row, AR.SIXL, AR.STREET, AR.SIXL)

            const winning_middle = this.coordinate_matrix.filter((p) => p.y == winning_square.center.y)
            Point.multiple_set_position(winning_middle, AR.SPLIT, AR.SU, AR.SPLIT)

            if (position_type == POSITION.CENTER_MID || position_type == POSITION.CENTER_BOT) {
                const winning_top = this.coordinate_matrix.filter((p) => p.y == winning_square.tl.y)
                Point.multiple_set_position(winning_top, AR.CORNER, AR.SPLIT, AR.CORNER)
            }
            if (position_type == POSITION.CENTER_MID || position_type == POSITION.CENTER_TOP) {
                const winning_bottom = this.coordinate_matrix.filter((p) => p.y == winning_square.br.y)
                Point.multiple_set_position(winning_bottom, AR.CORNER, AR.SPLIT, AR.CORNER)
            }

        } else if ([POSITION.COLUMN_TOP, POSITION.COLUMN_MID, POSITION.COLUMN_BOT].includes(position_type)) {
            left_filler = top.ctrl_cv(DIRECTION.LEFT, { number: "2to1" }).array(DIRECTION.DOWN, 3)
            right_filler = top.ctrl_cv(DIRECTION.RIGHT).array(DIRECTION.DOWN, 3)
            this.rectangles = base_rectangles.concat(left_filler, right_filler)

            // extra filtering
            function not_on_column_area(point) { return point.x != top.tl.x }
            this.coordinate_matrix = this.coordinate_matrix.filter((point) => not_on_column_area(point))

            const top_row = this.coordinate_matrix.filter((p) => p.y == top.tl.y)
            Point.multiple_set_position(top_row, AR.STREET, AR.SIXL)

            const winning_middle = this.coordinate_matrix.filter((p) => p.y == winning_square.center.y)
            Point.multiple_set_position(winning_middle, AR.SU, AR.SPLIT)

            if (position_type == POSITION.COLUMN_MID || position_type == POSITION.COLUMN_BOT) {
                const winning_top = this.coordinate_matrix.filter((p) => p.y == winning_square.tl.y)
                Point.multiple_set_position(winning_top, AR.SPLIT, AR.CORNER)
            }
            if (position_type == POSITION.COLUMN_MID || position_type == POSITION.COLUMN_TOP) {
                const winning_bottom = this.coordinate_matrix.filter((p) => p.y == winning_square.br.y)
                Point.multiple_set_position(winning_bottom, AR.SPLIT, AR.CORNER)
            }
        } else if ([POSITION.ZERO_TOP, POSITION.ZERO_MID, POSITION.ZERO_BOT, POSITION.ZERO].includes(position_type)) {
            left_filler = top.ctrl_cv(DIRECTION.LEFT).array(DIRECTION.DOWN, 3)
            right_filler = zero
            this.rectangles = base_rectangles.concat(right_filler, left_filler)

            if (position_type == POSITION.ZERO) {
                // extra filtering
                this.coordinate_matrix = this.coordinate_matrix.filter((p) => p.x == zero.tl.x ||
                    p.x == zero.center.x && p.y == zero.center.y)

                const first_column = this.coordinate_matrix.filter((p) => p.x == zero.tl.x)
                Point.multiple_set_position(first_column, AR.CORNER, AR.SPLIT, AR.STREET, AR.SPLIT, AR.STREET, AR.SPLIT)

                const zero_su = this.coordinate_matrix.find((p) => p.x == zero.center.x && p.y == zero.center.y)
                zero_su.set_position(AR.SU)

            } else {
                const top_row = this.coordinate_matrix.filter((p) => p.y == top.tl.y)
                Point.multiple_set_position(top_row, AR.SIXL, AR.STREET, AR.CORNER)

                const winning_middle = this.coordinate_matrix.filter((p) => p.y == winning_square.center.y)
                Point.multiple_set_position(winning_middle, AR.SPLIT, AR.SU, AR.SPLIT)

                if (position_type == POSITION.ZERO_MID || position_type == POSITION.ZERO_BOT) {
                    const winning_top = this.coordinate_matrix.filter((p) => p.y == winning_square.tl.y)
                    Point.multiple_set_position(winning_top, AR.CORNER, AR.SPLIT, AR.STREET)
                }
                if (position_type == POSITION.ZERO_MID || position_type == POSITION.ZERO_TOP) {
                    const winning_bottom = this.coordinate_matrix.filter((p) => p.y == winning_square.br.y)
                    Point.multiple_set_position(winning_bottom, AR.CORNER, AR.SPLIT, AR.STREET)
                }
            }

        }
        Rectangle.extend_background(background, left_filler, right_filler)
        Rectangle.extend_header(header, left_filler, right_filler)
        header_background.overlap(header)
        bets.forEach((position) => chip_placing_fn(this.chips, position, this.coordinate_matrix))
    }
    get_payout() {
        return this.chips.reduce((int, chip) => int + chip.position, 0)
    }
    // tl - top left, br - bottom right
    static generate_matrix(tl, br, n_rows, n_cols) {
        const points = [];

        const x_step = (br.x - tl.x) / (n_cols - 1);
        const y_step = (br.y - tl.y) / (n_rows - 1);

        // NOTE: columns first affects the order chips get placed in place_flat
        for (let col = 0; col < n_cols; col++) {
            for (let row = 0; row < n_rows; row++) {
                const x = tl.x + col * x_step;
                const y = tl.y + row * y_step;
                points.push(new Point(x, y));
            }
        }

        return points;
    }
    static generate_views(n, pb_count) {
        const result = []
        for (let i = 0; i < n; i++) {
            const bets = PICTURE_BETS.get(...Random.pick_n(pb_count, Object.keys(PICTURE_BETS.pbs)))
            const available_positions = bets.includes(5) ? Object.values(POSITION).filter((p) => p != POSITION.ZERO) : Object.values(POSITION)

            result.push(new View(bets, Random.pick_one(available_positions), View.place_flat))
        }
        return result
    }
    static place_flat(chip_array, position, available_positions) {
        const same_type_positions = available_positions.filter((p) => p.position == position)
        console.assert(same_type_positions.length > 0, `ERROR in place_flat: trying to place position of payout value of ${position} \nMight be trying to place sixline on Zero`)

        // sort by how many chips are on a specific position (ascending) and add the first one
        chip_array.push(same_type_positions.toSorted((a, b) => a.count(chip_array) - b.count(chip_array))[0])
    }

}
export { AR, POSITION, View, TempView, PICTURE_BETS }