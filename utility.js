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