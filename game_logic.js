import { add_element, remove_children } from "./utility.js"

var index = 0
var picture_bets = []
var order = null
var multipliers = null

const around_zero = [{ chips: [{ x: 2, y: 0 }, { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 4 }, { x: 3, y: 0 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 0 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }], answer: 165 },
{ chips: [{ x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }], answer: 108 },
{ chips: [{ x: 4, y: 0 }, { x: 4, y: 1 }], answer: 25 },
{ chips: [{ x: 4, y: 1 }, { x: 4, y: 3 }, { x: 4, y: 5 }, { x: 5, y: 3 }], answer: 86 },
{ chips: [{ x: 4, y: 0 }, { x: 4, y: 2 }, { x: 4, y: 4 }, { x: 5, y: 3 }], answer: 65 },
{ chips: [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }], answer: 36 },
{ chips: [{ x: 4, y: 0 }, { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 4, y: 5 }, { x: 5, y: 3 }], answer: 116 },
{ chips: [{ x: 4, y: 0 }, { x: 4, y: 1 }, { x: 4, y: 2 }], answer: 36 },
{ chips: [{ x: 2, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 2 }, { x: 4, y: 3 }], answer: 105 },
{ chips: [{ x: 4, y: 0 }, { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 4, y: 5 }], answer: 81 },
{ chips: [{ x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }], answer: 24 },
{ chips: [{ x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 4, y: 5 }], answer: 73 },
{ chips: [{ x: 4, y: 0 }, { x: 4, y: 2 }, { x: 4, y: 4 }], answer: 30 },
{ chips: [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 4, y: 0 }, { x: 4, y: 1 }, { x: 4, y: 2 }], answer: 129 },
{ chips: [{ x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }], answer: 39 }]

const uncommon = [{ chips: [{ x: 0, y: 0 }, { x: 0, y: 2 },], answer: 13 },
{ chips: [{ x: 1, y: 0 }, { x: 1, y: 2 },], answer: 28 },
{ chips: [{ x: 0, y: 0 }, { x: 1, y: 0 },], answer: 16 },
{ chips: [{ x: 1, y: 3 }, { x: 2, y: 2 },], answer: 43 },
{ chips: [{ x: 2, y: 0 }, { x: 2, y: 1 },], answer: 22 },
{ chips: [{ x: 1, y: 0 }, { x: 1, y: 1 },], answer: 46 },
{ chips: [{ x: 0, y: 2 }, { x: 1, y: 0 },], answer: 19 },
{ chips: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },], answer: 21 },
{ chips: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 },], answer: 71 },
{ chips: [{ x: 1, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 3 },], answer: 42 },
{ chips: [{ x: 0, y: 0 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 1, y: 2 },], answer: 47 },
{ chips: [{ x: 0, y: 3 }, { x: 1, y: 2 }, { x: 1, y: 3 }, { x: 2, y: 3 },], answer: 86 },
{ chips: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 },], answer: 63 }]

const common = [{ chips: [{ x: 0, y: 0 }, { x: 1, y: 3 }], answer: 40 },
{ chips: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }], answer: 30 },
{ chips: [{ x: 0, y: 2 }, { x: 1, y: 3 }, { x: 2, y: 4 }], answer: 51 },
{ chips: [{ x: 0, y: 3 }, { x: 1, y: 3 }], answer: 52 },
{ chips: [{ x: 0, y: 2 }, { x: 0, y: 3 }], answer: 25 },
{ chips: [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }], answer: 33 },
{ chips: [{ x: 0, y: 2 }, { x: 1, y: 3 }, { x: 2, y: 2 }], answer: 51 },
{ chips: [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 3 }], answer: 60 },
{ chips: [{ x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 }], answer: 69 },
{ chips: [{ x: 0, y: 3 }, { x: 1, y: 2 }, { x: 1, y: 3 }, { x: 1, y: 4 }, { x: 2, y: 3 }], answer: 103 },
{ chips: [{ x: 0, y: 2 }, { x: 0, y: 4 }, { x: 1, y: 3 }, { x: 2, y: 2 }, { x: 2, y: 4 }], answer: 67 },
{ chips: [{ x: 0, y: 2 }, { x: 0, y: 3 }, { x: 1, y: 2 }, { x: 1, y: 3 }, { x: 2, y: 2 }, { x: 2, y: 3 }], answer: 102 },
{ chips: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 0 }, { x: 2, y: 1 }], answer: 90 },
{ chips: [{ x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }, { x: 1, y: 3 }, { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 4 }], answer: 101 },
{ chips: [{ x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }, { x: 1, y: 2 }, { x: 1, y: 4 }, { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 4 }], answer: 100 },
{ chips: [{ x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }, { x: 1, y: 2 }, { x: 1, y: 3 }, { x: 1, y: 4 }, { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 4 }], answer: 135 }]

var start = -1
var mistake_counter = 0
const times = []

function shuffle(array) {
    // Fisher-Yates Shuffle Algorithm
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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
function populate_table(chips, multiplier, x_offset = 12, y_offset = 0, x_step = 6, y_step = 5, radius = 2) {
    const table = document.getElementById('table')
    chips.forEach((element, index, array) => {
        add_chip(table, (element.x * x_step) + x_offset, (element.y * y_step) + y_offset, radius, multiplier)
        add_element(table,
            'text',
            `x${multiplier}`,
            { x: (element.x * x_step) + (x_offset - radius / 2), y: (element.y * y_step) + (y_offset + radius / 4) },
            'http://www.w3.org/2000/svg')
    });
}
function handle_answer(event) {
    // console.log("handling button:", event)
    if (this.className == "") {
        if (parseInt(this.textContent) == picture_bets[order[index]].answer * multipliers[index]) {
            this.classList.add('correct')
            document.getElementById('next').removeAttribute('hidden')
        } else {
            this.classList.add('incorrect')
            mistake_counter++
        }
    }
}

function handle_next() {
    document.getElementById('next').setAttribute('hidden', 'hidden')
    const table = document.getElementById('table')
    const buttons = document.getElementById('buttons')
    remove_children(table, 'circle')
    remove_children(table, 'text')
    remove_children(buttons, 'button')
    index++
    if (index < picture_bets.length) {
        // TODO: abstract to a single function (code repeats in load event listener)
        update_counter()
        populate_table(picture_bets[order[index]].chips, multipliers[index])
        populate_buttons(picture_bets[order[index]].answer, multipliers[index])
        times.push(parseFloat(((Date.now() - start) / 1000).toFixed(2)))
        start = Date.now()
    } else {
        // results
        const average_time = (times.reduce((a, b) => a + b, 0) / times.length)
        const accuracy = (picture_bets.length - mistake_counter) / picture_bets.length
        sessionStorage.setItem("score", `${parseInt((30 / average_time) * accuracy)}`)
        sessionStorage.setItem("quickest", `${picture_bets[order[times.indexOf(Math.min(...times))]].answer} (${Math.min(...times)} s)`)
        sessionStorage.setItem("average", `${average_time.toFixed(2)} s`)
        sessionStorage.setItem("accuracy", `${parseInt(100 * accuracy)} %`)
        window.location.href = 'result.html'
    }
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
    counter.textContent = `${index + 1}/${picture_bets.length}`
}

function key_is_set(key) {
    return sessionStorage.getItem(key) != null
}

const AR = {
    SIXL: 5,
    CORNER: 8,
    STREET: 11,
    SPLIT: 17,
    SU: 35
}
const TYPE = {
    ZERO: "0",
    _1: "1",
    _2: "2",
    _3: "3",
    _4: "4",
    _5: "5",
    _6: "6",
    _7: "7",
}
class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.position = null
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
            [TYPE._1]: middle,
            [TYPE._2]: middle,
            // TODO: replace 69 with something random
            [TYPE._3]: 69 % 2 == 0 ? top : bottom,
            [TYPE._4]: top,
            [TYPE._5]: bottom,
            // TODO: replace 69 with something random
            [TYPE._6]: 69 % 2 == 0 ? top : bottom,
            [TYPE._7]: middle,
        }[number_type]

        this.base_coordinate_matrix = View.generate_matrix(top.tl, bottom.br, 7, 3)

        function is_within_winning_square(point) { return winning_square.tl.y <= point.y && point.y <= winning_square.br.y }
        function not_at_bottom_row(point) { return point.y != bottom.br.y }
        this.coordinate_matrix = this.base_coordinate_matrix.filter((point) => point.y == top.tl.y ||
            is_within_winning_square(point) && not_at_bottom_row(point))

        this.chips = []
        if ([TYPE._1, TYPE._4, TYPE._5].includes(number_type)) {
            this.svg = base_svg

            // top row is always SIXL, STREET, SIXL
            const top_row = this.coordinate_matrix.filter((p) => p.y == top.tl.y)
            Point.multiple_set_position(top_row, AR.SIXL, AR.STREET, AR.SIXL)

            const winning_middle = this.coordinate_matrix.filter((p) => p.y == winning_square.center.y)
            Point.multiple_set_position(winning_middle, AR.SPLIT, AR.SU, AR.SPLIT)

            if (number_type == TYPE._1 || number_type == TYPE._5) {
                const winning_top = this.coordinate_matrix.filter((p) => p.y == winning_square.tl.y)
                Point.multiple_set_position(winning_top, AR.CORNER, AR.SPLIT, AR.CORNER)
            }
            if (number_type == TYPE._1 || number_type == TYPE._4) {
                const winning_bottom = this.coordinate_matrix.filter((p) => p.y == winning_square.br.y)
                Point.multiple_set_position(winning_bottom, AR.CORNER, AR.SPLIT, AR.CORNER)
            }
            positions.forEach((position) => chip_placing_fn(position, this.chips, this.coordinate_matrix))
        }
    }
    // tl - top left, br - bottom right
    static generate_matrix(tl, br, n_rows, n_cols) {
        const points = [];

        const x_step = (br.x - tl.x) / (n_cols - 1);
        const y_step = (br.y - tl.y) / (n_rows - 1);

        for (let row = 0; row < n_rows; row++) {
            for (let col = 0; col < n_cols; col++) {
                const x = tl.x + col * x_step;
                const y = tl.y + row * y_step;
                points.push(new Point(x, y));
            }
        }

        return points;
    }

}
addEventListener('load', (event) => {
    document.getElementById("next").onclick = handle_next

    const pb_mapping = { 'common_pb': common, 'uncommon_pb': uncommon, 'around_zero_pb': around_zero }
    for (let key in pb_mapping) {
        if (key_is_set(key) && sessionStorage.getItem(key) === 'true') {
            picture_bets = picture_bets.concat(pb_mapping[key])
        }
    }

    order = shuffle(Array.from({ length: picture_bets.length }, (_, index) => index))
    multipliers = shuffle(Array.from({ length: picture_bets.length }, (_, index) => index % 7 + 1))

    update_counter()
    const view = new View([AR.SU], TYPE._1, (position) => "returns nothing")
    view.svg.forEach((svg_element) => {
        add_element(document.getElementById("table"),
            "rect",
            null,
            svg_element.display(),
            "http://www.w3.org/2000/svg")
    }
    )
    // TODO: change to view.chips when appropriate
    view.coordinate_matrix.forEach((chip) =>
        add_chip(document.getElementById("table"), chip.x, chip.y, .9, chip.position))
    // populate_table(picture_bets[order[index]].chips, multipliers[index])
    populate_buttons(picture_bets[order[index]].answer, multipliers[index])
    start = Date.now()
})