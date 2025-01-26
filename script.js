var index = 0
const picture_bets = [{ chips: [{ x: 0, y: 0 }, { x: 1, y: 3 }], answer: 40 },
{ chips: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }], answer: 30 },
{ chips: [{ x: 0, y: 2 }, { x: 1, y: 3 }, { x: 2, y: 4 }], answer: 51 },
{ chips: [{ x: 0, y: 3 }, { x: 1, y: 3 }], answer: 52 },
{ chips: [{ x: 0, y: 2 }, { x: 0, y: 3 }], answer: 25 },
{ chips: [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }], answer: 33 },
{ chips: [{ x: 0, y: 2 }, { x: 1, y: 3 }, { x: 2, y: 2 }], answer: 51 },
{ chips: [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 3 }], answer: 60 },
{ chips: [{ x: 0, y: 3 }, { x: 1, y: 2 }, { x: 1, y: 3 }, { x: 1, y: 4 }, { x: 2, y: 3 }], answer: 103 },
{ chips: [{ x: 0, y: 2 }, { x: 0, y: 4 }, { x: 1, y: 3 }, { x: 2, y: 2 }, { x: 2, y: 4 }], answer: 67 },
{ chips: [{ x: 0, y: 2 }, { x: 0, y: 3 }, { x: 1, y: 2 }, { x: 1, y: 3 }, { x: 2, y: 2 }, { x: 2, y: 3 }], answer: 102 },
{ chips: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 0 }, { x: 2, y: 1 }], answer: 90 },
{ chips: [{ x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }, { x: 1, y: 3 }, { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 4 }], answer: 101 },
{ chips: [{ x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }, { x: 1, y: 2 }, { x: 1, y: 4 }, { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 4 }], answer: 100 },
{ chips: [{ x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }, { x: 1, y: 2 }, { x: 1, y: 3 }, { x: 1, y: 4 }, { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 4 }], answer: 135 }]

const order = shuffle(Array.from({ length: picture_bets.length }, (_, index) => index))
var start = -1
const times = []

function shuffle(array) {
    // Fisher-Yates Shuffle Algorithm
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
function add_circle(parent, x, y, radius = 2) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.setAttribute("cx", x)
    circle.setAttribute("cy", y)
    circle.setAttribute("r", radius)
    parent.appendChild(circle)
}
function populate_table(chips, x_offset = 12, y_offset = 0, x_step = 6, y_step = 5) {
    // console.log(`adding picture bet chips ${JSON.stringify(chips)}`)
    const table = document.getElementById('table')
    chips.forEach((element, index, array) => {
        add_circle(table, (element.x * x_step) + x_offset, (element.y * y_step) + y_offset)
    });
}
function handle_answer(event) {
    // console.log("handling button:", event)
    if (this.className == "") {
        if (parseInt(this.textContent) == picture_bets[order[index]].answer) {
            this.classList.add('correct')
            document.getElementById('next').removeAttribute('hidden')
        } else {
            this.classList.add('incorrect')
        }
    }
}
function remove_children(parent, type) {
    const children = parent.querySelectorAll(type);
    children.forEach(child => parent.removeChild(child));
}
function handle_next() {
    document.getElementById('next').setAttribute('hidden', 'hidden')
    const table = document.getElementById('table')
    const buttons = document.getElementById('buttons')
    remove_children(table, 'circle')
    remove_children(buttons, 'button')
    index++
    if (index < picture_bets.length) {
        populate_table(picture_bets[order[index]].chips)
        populate_buttons(picture_bets[order[index]].answer)
        times.push(Math.floor((Date.now() - start) / 1000))
    } else {
        const total_time = times.reduce((previous, current) => previous + current, 0)
        // show results
        add_text(document.body, 'h2', 'thanks for playing')
        add_text(document.body, 'h3', `you answered ${picture_bets.length} picture bets in ${total_time} seconds`)
        add_text(document.body, 'h3', `average time to answer was ${total_time / times.length} seconds`)
        add_text(document.body, 'a', 'play again', { href: 'index.html' })
    }
}
function add_text(parent, child_type, text, attributes = null) {
    const element = document.createElement(child_type)
    if (attributes != null) {
        for (const key in attributes) {
            element.setAttribute(key, attributes[key])
        }
    }
    element.textContent = text
    parent.appendChild(element)
}
function add_button(parent, text) {
    const button = document.createElement('button')
    button.textContent = text
    button.addEventListener('click', handle_answer)
    parent.appendChild(button)
}
function populate_buttons(answer) {
    const buttons = document.getElementById('buttons')
    const button_count = 3
    n = order[index] % button_count
    for (let i = 0; i < n; i++) {
        add_button(buttons, answer - (n - i))
    }
    add_button(buttons, answer)

    for (let i = 0; i < button_count - (n + 1); i++) {
        add_button(buttons, answer + (i + 1))
    }
}

addEventListener('load', (event) => {
    populate_table(picture_bets[order[index]].chips)
    populate_buttons(picture_bets[order[index]].answer)
    start = Date.now()
})