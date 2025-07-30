export class Random {
    static pick_n(n, array, combination = false) {
        console.assert(array.length != null, "Random.pick recieved argument with undefined length attribute")
        if (combination) {
            // TODO
            console.assert(false, "ERROR: no implementation")
        }
        return Array.from({ length: n }, (_) => array[parseInt(Math.random() * array.length)])

    }
    static pick_one(array) {
        return this.pick_n(1, array)[0]
    }
}

export function range(start, stop, step = 1) {
    console.assert(step != 0, "ERROR: step must not be zero")

    if (stop == undefined) {
        stop = start
        start = 0
    }
    const length = Math.max(Math.ceil((stop - start) / step), 0);
    return Array.from({ length: length }, (_, index) => start + index * step)
}

export function add_element(parent, child_type, text = null, attributes = null, namespace = null) {
    let element;
    if (namespace != null) {
        element = document.createElementNS(namespace, child_type)
    } else {
        element = document.createElement(child_type)
    }
    if (attributes != null) {
        for (const key in attributes) {
            element.setAttribute(key, attributes[key])
        }
    }
    if (text != null) {
        element.textContent = text
    }
    parent.appendChild(element)
}

export function remove_children(parent, type) {
    const children = parent.querySelectorAll(type);
    children.forEach(child => parent.removeChild(child));
}

export function contains_alphanum(n) {
    const str_n = String(n)
    for (let i = 0; i < str_n.length; i++) {
        const code = str_n.charCodeAt(i)
        if ((code > 64 && code < 91) || // upper alpha (A-Z)
            (code > 96 && code < 123) // lower alpha (a-z)
        ) return true
    } return false
}
export function add_chip(parent, x, y, radius, count) {
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
        `${count}`,
        { class: "chip", x: x, y: y },
        'http://www.w3.org/2000/svg')
}