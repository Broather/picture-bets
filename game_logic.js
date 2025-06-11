import { add_element, remove_children } from "./utility.js"

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
const picture_bets = {
    pbs: {
        // small
        "43": [AR.SU, AR.CORNER],
        // medium
        "103": [AR.SU, AR.SPLIT, AR.SPLIT, AR.SPLIT, AR.SPLIT],
        "102": [AR.SU, AR.SPLIT, AR.SPLIT, AR.SPLIT, AR.CORNER, AR.CORNER]
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
            `x${multiplier}`,
            { x: x - radius / 2, y: y + radius / 4 },
            'http://www.w3.org/2000/svg')
    }
}

function handle_answer(event) {
    // console.log("handling button:", event)
    if (this.className == "") {
        if (parseInt(this.textContent) == state.view.get_payout()) {
            this.classList.add('correct')
            document.getElementById('next').removeAttribute('hidden')
        } else {
            this.classList.add('incorrect')
            state.mistakes++
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
    // TODO: re-implement
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
    constructor(x, y, width, height, padding = null) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.padding = padding

        this.tl = new Point(x, y)
        this.br = new Point(x + width, y + height)
        this.center = new Point(x + width / 2, y + height / 2)
        this.style = {}
    }
    ctrl_cv(changes = {}) {
        return new Rectangle(
            changes.x !== undefined ? changes.x : this.x,
            changes.y !== undefined ? changes.y : this.y + this.height,
            changes.width !== undefined ? changes.width : this.width,
            changes.height !== undefined ? changes.height : this.height,
            changes.padding !== undefined ? changes.padding : this.padding
        )
    }
    set_style(style) {
        this.style = { style: style }
        return this
    }
    display() {
        return Object.assign({
            x: this.x + (this.padding ? this.padding : 0),
            y: this.y + (this.padding ? this.padding : 0),
            width: this.width - (this.padding ? 2 * this.padding : 0),
            height: this.height - (this.padding ? 2 * this.padding : 0)
        }, this.style)
    }
}
class View {
    constructor(positions, number_type, chip_placing_fn) {
        const background = new Rectangle(5.75, -.25, 4.5, 16.5).set_style("fill: black")
        const header = new Rectangle(6, 0, 4, 1, .25)
        const top = header.ctrl_cv({ height: 5 }).set_style("fill: red")
        const middle = top.ctrl_cv().set_style("fill: orange")
        const bottom = middle.ctrl_cv().set_style("fill: green")
        const base_svg = [background, header, top, middle, bottom]
        const winning_square = {
            [POSITION.ZERO_TOP]: top,
            [POSITION.ZERO_MID]: middle,
            [POSITION.ZERO_BOT]: bottom,
            [POSITION.CENTER_TOP]: top,
            [POSITION.CENTER_MID]: middle,
            [POSITION.CENTER_BOT]: bottom,
            [POSITION.COLUMN_TOP]: top,
            [POSITION.COLUMN_MID]: middle,
            [POSITION.COLUMN_BOT]: bottom
        }[number_type]

        this.base_coordinate_matrix = View.generate_matrix(top.tl, bottom.br, 7, 3)

        function is_within_winning_square(point) { return winning_square.tl.y <= point.y && point.y <= winning_square.br.y }
        function not_at_bottom_row(point) { return point.y != bottom.br.y }
        this.coordinate_matrix = this.base_coordinate_matrix.filter((point) => point.y == top.tl.y ||
            is_within_winning_square(point) && not_at_bottom_row(point))

        this.chips = []
        if ([POSITION.CENTER_TOP, POSITION.CENTER_MID, POSITION.CENTER_BOT].includes(number_type)) {
            this.svg = base_svg

            // top row is always SIXL, STREET, SIXL
            const top_row = this.coordinate_matrix.filter((p) => p.y == top.tl.y)
            Point.multiple_set_position(top_row, AR.SIXL, AR.STREET, AR.SIXL)

            const winning_middle = this.coordinate_matrix.filter((p) => p.y == winning_square.center.y)
            Point.multiple_set_position(winning_middle, AR.SPLIT, AR.SU, AR.SPLIT)

            if (number_type == POSITION.CENTER_MID || number_type == POSITION.CENTER_BOT) {
                const winning_top = this.coordinate_matrix.filter((p) => p.y == winning_square.tl.y)
                Point.multiple_set_position(winning_top, AR.CORNER, AR.SPLIT, AR.CORNER)
            }
            if (number_type == POSITION.CENTER_MID || number_type == POSITION.CENTER_TOP) {
                const winning_bottom = this.coordinate_matrix.filter((p) => p.y == winning_square.br.y)
                Point.multiple_set_position(winning_bottom, AR.CORNER, AR.SPLIT, AR.CORNER)
            }
            positions.forEach((position) => chip_placing_fn(this.chips, position, this.coordinate_matrix))
        }
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
    static place_flat(chip_array, position, available_positions) {
        const filtered_positions = available_positions.filter((p) => p.position == position)

        // sort by how many chips are on a specific position (ascending) and add the first one
        chip_array.push(filtered_positions.toSorted((a, b) => a.count(chip_array) -
            b.count(chip_array))[0])
    }

}
function set_up() {
    update_counter()

    state.view.svg.forEach((svg_element) => {
        add_element(document.getElementById("table"),
            "rect",
            null,
            svg_element.display(),
            "http://www.w3.org/2000/svg")
    }
    )
    state.view.chips.forEach((chip, _, chip_array) =>
        add_chip(document.getElementById("table"), chip.x, chip.y, .9, chip.count(chip_array)))
    // populate_table(picture_bets[order[index]].chips, multipliers[index])
    populate_buttons(state.view.get_payout(), 1)
    state.tick = Date.now()
}
function clear() {
    const table = document.getElementById('table')
    const buttons = document.getElementById('buttons')
    remove_children(table, 'rect')
    remove_children(table, 'circle')
    remove_children(table, 'text')
    remove_children(buttons, 'button')
}
addEventListener('load', (event) => {
    document.getElementById("next").onclick = handle_next

    state.views = [new View(picture_bets.get(103, 102), POSITION.CENTER_BOT, View.place_flat),
    new View(picture_bets.get(43), POSITION.CENTER_MID, View.place_flat)]
    set_up()
})