import { add_element, remove_children, remove_classes } from "./utility.js"

const state = {
    _id: -1,
    index: 0,
    views: [],
    get id() {
        return ++this._id
    },
    peek_id() {
        return this._id
    },
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

function handle_multiple_choice(event) {
    const _this = event.target
    function any_button_has(_class) {
        return Array.from(document.getElementById("buttons").children).some((c) => c.className.trim() == _class)
    }
    if (!any_button_has("correct")) {
        if (parseInt(_this.textContent) == state.view.get_payout()) {
            _this.classList.add('correct')
            document.getElementById('next').removeAttribute('hidden')
        } else {
            if (!any_button_has("incorrect")) { state.mistakes++ }

            _this.classList.add('incorrect')
        }
    }
}

function handle_modal_check(event) {
    const _this = event.target
    if (parseInt(document.getElementById("modal_payout").textContent) == state.view.get_payout()) {
        _this.classList.add('correct')
        document.getElementById("modal_input").disabled = true
        document.getElementById('next').removeAttribute('hidden')
    } else {
        _this.classList.add('incorrect')
        state.mistakes++
    }
}

function handle_next() {
    document.getElementById('next').setAttribute('hidden', 'hidden')
    document.getElementById('modal_input').disabled = false
    close_modal()
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

function open_modal() {
    document.getElementById("modal").style.display = "block"
    document.getElementById("modal_input").focus()

    document.getElementById("answer").disabled = true
}

function close_modal(though_peek = false) {
    document.getElementById("modal").style.display = "none"
    if (!though_peek) { answer.disabled = false }
}

function add_chip(parent, x, y, radius, count) {
    const mask = add_element(null,
        'mask',
        null,
        { id: `circle_mask_${state.id}`, "mask-type": "luminance" },
        'http://www.w3.org/2000/svg'
    )
    add_element(mask,
        'circle',
        null,
        { cx: x, cy: y, r: radius, style: "fill: white; stroke: none" },
        'http://www.w3.org/2000/svg')

    parent.appendChild(mask)
    add_element(parent,
        'circle',
        null,
        { class: "outer", cx: x, cy: y, r: radius, pathLength: 40, mask: `url(#circle_mask_${state.peek_id()})` },
        'http://www.w3.org/2000/svg')
    add_element(parent,
        'circle',
        null,
        { class: "inner", cx: x, cy: y, r: radius - 0.3 * radius, pathLength: 29 },
        'http://www.w3.org/2000/svg')
    add_element(parent,
        'text',
        `${count}`,
        { class: "chip", x: x, y: y },
        'http://www.w3.org/2000/svg')
}

function add_button(parent, text) {
    const button = document.createElement('button')
    button.textContent = text
    button.addEventListener('click', handle_multiple_choice)
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
    const modal_check = document.getElementById("modal_check")
    // NOTE: important to remove mask elements before circles because they contain circle elements
    remove_children(table, 'mask')
    remove_children(table, 'rect')
    remove_children(table, 'circle')
    remove_children(table, 'text')
    remove_children(table, 'polygon')
    // remove_children(buttons, 'button')
    remove_classes(modal_check, ["correct", "incorrect"])
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

    set_up_modal()
    // populate_buttons(state.view.get_payout())
    state.tick = Date.now()
}

function set_up_modal() {
    const modal = document.getElementById("modal")
    const modal_close = document.getElementById("close")
    const modal_input = document.getElementById("modal_input")
    const modal_peek = document.getElementById("modal_peek")
    const modal_payout = document.getElementById("modal_payout")
    const modal_check = document.getElementById("modal_check")

    document.getElementById('modal_input').value = ""
    document.getElementById('modal_payout').innerHTML = 0

    modal_input.oninput = (event) => {
        modal_payout.innerHTML = modal_input.value
        if (modal_check.classList.length > 0) { remove_classes(modal_check, ["correct", "incorrect"]) }
    }

    modal_close.onclick = (event) => {
        close_modal()
    }
    window.onclick = (event) => {
        if (event.target == modal) {
            close_modal()
        }
    }
    // Hide modal while button is held
    modal_peek.addEventListener("mousedown", () => {
        close_modal(true)
    })

    // Show modal again on release (mouseup anywhere on document)
    document.addEventListener("mouseup", () => {
        if (answer.disabled == true) {
            open_modal()
        }
    })
}

export { state, set_up, handle_next, handle_modal_check as handle_modal, open_modal, update_counter, add_chip }