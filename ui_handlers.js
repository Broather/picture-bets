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
    if (parseInt(document.getElementById("modal_input").value) == state.view.get_payout()) {
        _this.classList.add('correct')
        document.getElementById("modal_input").disabled = true
        document.getElementById('next').removeAttribute('hidden')
    } else {
        // TODO: count mistakes in an array of 1s and make it a 0 if we make it to this code branch
        state.mistakes++
        _this.classList.add('incorrect')
    }
}

function handle_next() {
    document.getElementById('next').setAttribute('hidden', 'hidden')
    close_modal()
    document.getElementById('modal_input').disabled = false
    document.getElementById('modal_input').value = ""
    knock_em_down(document.getElementById("table"))
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
    build_em_up(document.getElementById("table"), state.view)
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

function build_em_up(svg_target, view) {
    update_counter()

    view.rectangles.forEach((rectangle) => {
        add_element(svg_target,
            rectangle.number == 0 ? "polygon" : "rect",
            null,
            rectangle.to_svg_rect(),
            "http://www.w3.org/2000/svg")
        if (rectangle.number != null) {
            add_element(svg_target,
                "text",
                rectangle.number,
                rectangle.to_svg_text(),
                "http://www.w3.org/2000/svg")
        }
    }
    )

    view.chips.forEach((chip, chip_index, chip_array) => {
        // if chip is at the top
        if (!chip_array.slice(chip_index + 1).includes(chip)) {
            add_chip(svg_target, chip.x, chip.y, 1, chip.count(chip_array))
        }
    })

    // populate_buttons(state.view.get_payout())
    state.tick = Date.now()
}

function knock_em_down(svg_target) {
    const modal_check = document.getElementById("modal_check")
    // NOTE: important to remove mask elements before circles because they contain circle elements
    remove_children(svg_target, 'mask')
    remove_children(svg_target, 'rect')
    remove_children(svg_target, 'circle')
    remove_children(svg_target, 'text')
    remove_children(svg_target, 'polygon')
    // remove_children(buttons, 'button')
    remove_classes(modal_check, ["correct", "incorrect"])
}


function set_modal_event_listeners() {
    const modal_check = document.getElementById("modal_check")
    modal_check.onclick = handle_modal_check

    document.getElementById("close").onclick = (event) => {
        close_modal()
    }
    window.onclick = (event) => {
        if (event.target == document.getElementById("modal")) {
            close_modal()
        }
    }
    // Hide modal while button is held
    document.getElementById("modal_peek").addEventListener("mousedown", () => {
        close_modal(true)
    })

    // Show modal again on release (mouseup anywhere on document)
    document.addEventListener("mouseup", () => {
        if (answer.disabled == true) {
            open_modal()
        }
    })
}

export { state, build_em_up, knock_em_down, handle_next, set_modal_event_listeners, open_modal, update_counter, add_chip }