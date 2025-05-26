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