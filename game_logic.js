import { add_element, remove_children, contains_alphanum, Random, range } from "./utility.js"

const state = {
    index: 0,
    views: [],
    get view() {
        return this.views[this.index]
    },
    game_should_end() {
        return this.index >= this.views.length
    },
    mistakes: 0,
    tick: -1,
    times: [],
    delta_time(tock) {
        this.times.push(parseFloat(((tock - this.tick) / 1000).toFixed(2)))
    },
    average_delta_time() {
        return this.times.reduce((a, b) => a + b, 0) / this.times.length
    }
}

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
    TOWARDS_USER: "TOWARDS_USER"
}
const PICTURE_BETS = {
    pbs: {
        // single
        "5": [AR.SIXL],
        "11": [AR.STREET],
        // small
        "43": [AR.SU, AR.CORNER],
        "69": [AR.SU, AR.SPLIT, AR.SPLIT],
        // medium
        "103": [AR.SU, AR.SPLIT, AR.SPLIT, AR.SPLIT, AR.SPLIT],
        "102": [AR.SU, AR.SPLIT, AR.SPLIT, AR.SPLIT, AR.CORNER, AR.CORNER],
        // large
        "165": [AR.SU, AR.SPLIT, AR.SPLIT, AR.SPLIT, AR.SPLIT, AR.STREET, AR.STREET, AR.STREET, AR.CORNER, AR.CORNER, AR.CORNER, AR.SIXL]
    },
    get(...keys) {
        return keys.flatMap((key) => this.pbs[key] || [])
    }
}

function add_chip(parent, x, y, radius, multiplier = null) {
    add_element(parent,
        'circle',
        null,
        { cx: x, cy: y, r: radius, stroke: "white", "stroke-width": 0.3, "stroke-dasharray": "0.3, 0.6" },
        'http://www.w3.org/2000/svg',)
    add_element(parent,
        'circle',
        null,
        { cx: x, cy: y, r: radius - 0.3 * radius, stroke: "white", "stroke-width": 0.1, "stroke-dasharray": 0.25 },
        'http://www.w3.org/2000/svg')
    if (multiplier != null) {
        add_element(parent,
            'text',
            `${multiplier}`,
            { class: "chip", x: x, y: y },
            'http://www.w3.org/2000/svg')
    }
}

function handle_answer(event) {
    function any_button_has(_class) {
        return Array.from(document.getElementById("buttons").children).some((c) => c.className.trim() == _class)
    }
    if (!any_button_has("correct")) {
        if (parseInt(this.textContent) == state.view.get_payout()) {
            this.classList.add('correct')
            document.getElementById('next').removeAttribute('hidden')
        } else {
            if (!any_button_has("incorrect")) { state.mistakes++ }

            this.classList.add('incorrect')
        }
    }
}

function handle_next() {
    document.getElementById('next').setAttribute('hidden', 'hidden')
    clear()
    state.index++
    if (state.game_should_end()) {
        // results
        const average_time = state.average_delta_time()
        const accuracy = (state.views.length - state.mistakes) / state.views.length
        sessionStorage.setItem("total", `${state.views.length}`)
        sessionStorage.setItem("average", `${average_time.toFixed(2)} s`)
        sessionStorage.setItem("accuracy", `${parseInt(100 * accuracy)} %`)
        window.location.href = 'result.html'
        return
    }
    state.delta_time(Date.now())
    set_up()
}
function add_button(parent, text) {
    const button = document.createElement('button')
    button.textContent = text
    button.addEventListener('click', handle_answer)
    parent.appendChild(button)
}
function populate_buttons(answer, multiplier) {
    const buttons = document.getElementById('buttons')
    const total_buttons = 3

    const n = Math.floor(Math.random() * total_buttons)
    for (let i = 0; i < n; i++) {
        add_button(buttons, answer * multiplier - (n - i))
    }
    add_button(buttons, answer * multiplier)

    for (let i = 0; i < total_buttons - (n + 1); i++) {
        add_button(buttons, answer * multiplier + (i + 1))
    }
}
function update_counter() {
    const counter = document.getElementById('counter')
    counter.textContent = `${state.index + 1}/${state.views.length}`
}

class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.position = null
    }
    // counts how many references of `this` array contains
    // NOTE: equality operator between points should work as intended as long as coordinates do not change
    count(array) {
        return array.filter((p) => p == this).length
    }
    set_position(position) {
        this.position = position
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

        this.tl = new Point(x, y)
        this.br = new Point(x + width, y + height)
        this.center = new Point(x + width / 2, y + height / 2)
    }
    ctrl_cv(direction, changes = {}) {
        let x, y, number
        switch (direction) {
            case DIRECTION.UP:
                x = this.x
                y = this.y - this.height
                number = !contains_alphanum(this.number) ? parseInt(this.number - 1) : this.number
                break
            case DIRECTION.DOWN:
                x = this.x
                y = this.y + this.height
                number = !contains_alphanum(this.number) ? parseInt(this.number + 1) : this.number
                break
            case DIRECTION.LEFT:
                x = this.x - this.width
                y = this.y
                number = !contains_alphanum(this.number) ? parseInt(this.number + 3) : this.number
                break
            case DIRECTION.RIGHT:
                x = this.x + this.width
                y = this.y
                number = !contains_alphanum(this.number) ? parseInt(this.number - 3) : this.number
                break
            case DIRECTION.TOWARDS_USER:
                x = this.x
                y = this.y
                number = this.number
            default:
                console.assert(false, "ERROR: unreachable")
                break
        }
        return new Rectangle(
            changes.x !== undefined ? changes.x : x,
            changes.y !== undefined ? changes.y : y,
            changes.width !== undefined ? changes.width : this.width,
            changes.height !== undefined ? changes.height : this.height,
            changes.number !== undefined ? changes.number : number,
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
    static create_zero_area(zero_rectangle) {
        const point_pairs = [
            `${zero_rectangle.tl.x + zero_rectangle.padding},${zero_rectangle.tl.y - zero_rectangle.height + zero_rectangle.padding}`,
            `${zero_rectangle.center.x - zero_rectangle.padding},${zero_rectangle.tl.y - zero_rectangle.height + zero_rectangle.padding}`,
            `${zero_rectangle.br.x - zero_rectangle.padding},${zero_rectangle.center.y}`,
            `${zero_rectangle.center.x - zero_rectangle.padding},${zero_rectangle.br.y + zero_rectangle.height - zero_rectangle.padding}`,
            `${zero_rectangle.tl.x + zero_rectangle.padding},${zero_rectangle.br.y + zero_rectangle.height - zero_rectangle.padding}`,
        ]
        zero_rectangle.tl = new Point(zero_rectangle.tl.x, zero_rectangle.tl.y - zero_rectangle.height)
        zero_rectangle.br = new Point(zero_rectangle.br.x, zero_rectangle.br.y + zero_rectangle.height)

        zero_rectangle.to_svg_rect = () => {
            return Object.assign({
                points: point_pairs.join(" ")
            }, zero_rectangle.style ? { style: zero_rectangle.style } : {})
        }
        return zero_rectangle
    }
    // returns a Rectangle object that overlaps all `rectangles`
    // and has a gradient to `direction` going from transparent to background_color
    static create_gradient(direction, rectangles) {
        // ** GPT 4o generated code start **
        // Initialize bounding box values
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        // Find the bounding box that contains all rectangles
        for (const rect of rectangles) {
            minX = Math.min(minX, rect.tl.x);
            minY = Math.min(minY, rect.tl.y);
            maxX = Math.max(maxX, rect.br.x);
            maxY = Math.max(maxY, rect.br.y);
        }

        const toppest_of_left = new Point(minX, minY);
        const bottomest_of_right = new Point(maxX, maxY);
        // ** GPT 4o generated code end **

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
class View {
    constructor(bets, position_type, chip_placing_fn) {
        Rectangle.set_style("fill: tan")
        Rectangle.set_padding(-.5)
        const background = new Rectangle(2, .5, 12, 15.5)
        Rectangle.set_style("fill: wheat")
        Rectangle.set_padding(.15)
        const header = new Rectangle(2, .4, 12, .6)

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
        const top = header.ctrl_cv(DIRECTION.DOWN, { x: 6, y: 1, width: 4, height: 5, number: top_number })
        const middle = top.ctrl_cv(DIRECTION.DOWN)
        const bottom = middle.ctrl_cv(DIRECTION.DOWN)
        const zero = Rectangle.create_zero_area(middle.ctrl_cv(DIRECTION.RIGHT, { number: 0 }))

        const base_rectangles = [background, header, top, middle, bottom]
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
        if ([POSITION.CENTER_TOP, POSITION.CENTER_MID, POSITION.CENTER_BOT].includes(position_type)) {
            const left_filler = top.ctrl_cv(DIRECTION.LEFT).array(DIRECTION.DOWN, 3)
            const right_filler = top.ctrl_cv(DIRECTION.RIGHT).array(DIRECTION.DOWN, 3)
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
            const left_filler = top.ctrl_cv(DIRECTION.LEFT, { number: "2to1" }).array(DIRECTION.DOWN, 3)
            const right_filler = top.ctrl_cv(DIRECTION.RIGHT).array(DIRECTION.DOWN, 3)
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
            const left_filler = top.ctrl_cv(DIRECTION.LEFT).array(DIRECTION.DOWN, 3)
            const right_filler = zero
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
        chip_array.push(same_type_positions.toSorted((a, b) => a.count(chip_array) -
            b.count(chip_array))[0])
    }

}
function set_up() {
    const table = document.getElementById("table")
    update_counter()

    state.view.rectangles.forEach((rectangle) => {
        add_element(table,
            rectangle.number == 0 ? "polygon" : "rect",
            null,
            rectangle.to_svg_rect(),
            "http://www.w3.org/2000/svg")
        if (rectangle.number != null) {
            add_element(table,
                "text",
                rectangle.number,
                rectangle.to_svg_text(),
                "http://www.w3.org/2000/svg")
        }
    }
    )

    state.view.chips.forEach((chip, _, chip_array) =>
        add_chip(document.getElementById("table"), chip.x, chip.y, .9, chip.count(chip_array)))
    // state.view.coordinate_matrix.forEach((chip, _, chip_array) =>
    //     add_chip(document.getElementById("table"), chip.x, chip.y, .9, chip.position))
    populate_buttons(state.view.get_payout(), 1)
    state.tick = Date.now()
}
function clear() {
    const table = document.getElementById('table')
    const buttons = document.getElementById('buttons')
    remove_children(table, 'rect')
    remove_children(table, 'circle')
    remove_children(table, 'text')
    remove_children(table, 'polygon')
    remove_children(buttons, 'button')
}

export { AR, POSITION, View, state, PICTURE_BETS as picture_bets, set_up, handle_next }