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
function add_chip(parent, x, y, radius, multiplier,) {
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
    add_element(parent,
        'text',
        `x${multiplier}`,
        { x: x - radius / 2, y: y + radius / 4 },
        'http://www.w3.org/2000/svg')
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
    populate_table(picture_bets[order[index]].chips, multipliers[index])
    populate_buttons(picture_bets[order[index]].answer, multipliers[index])
    start = Date.now()
})