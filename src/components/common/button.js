function Button(title, onclick) {
    return (`
        <button class="button" onclick="${onclick}">${title}</button>
    `);
}