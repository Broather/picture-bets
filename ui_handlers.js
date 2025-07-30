import { add_element, remove_children, add_chip } from "./utility.js"

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
function populate_buttons(answer) {
    const buttons = document.getElementById('buttons')
    const total_buttons = 3

    const n = Math.floor(Math.random() * total_buttons)
    for (let i = 0; i < n; i++) {
        add_button(buttons, answer - (n - i))
    }
    add_button(buttons, answer)

    for (let i = 0; i < total_buttons - (n + 1); i++) {
        add_button(buttons, answer + (i + 1))
    }
}
function update_counter() {
    const counter = document.getElementById('counter')
    counter.textContent = `${state.index + 1}/${state.views.length}`
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

function set_up() {
    const table = document.getElementById("table")
    document.getElementById("next").onclick = handle_next
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

    state.view.chips.forEach((chip, chip_index, chip_array) => {
        // if chip is at the top
        if (!chip_array.slice(chip_index + 1).includes(chip)) {
            add_chip(document.getElementById("table"), chip.x, chip.y, .9, chip.count(chip_array))
        }
    })

    // state.view.coordinate_matrix.forEach((chip, _, chip_array) =>
    //     add_chip(document.getElementById("table"), chip.x, chip.y, .9, chip.position))
    populate_buttons(state.view.get_payout())
    state.tick = Date.now()
}

export { state, set_up, handle_next, update_counter, populate_buttons }