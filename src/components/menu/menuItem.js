function menuItem(icon, title) {
    return (`
        <a class="menu-item" onclick="select(this)">
            <div style="display: flex;">
                <i class="bx bx-${icon}"></i>
                <p class="inter_16_m">${title}</p>
            </div>
            <i class="bx bx-caret-right"></i>
        </a>    
    `);
}

function select(event) {
    let menuItems = document.querySelectorAll(".menu-item");
    
    for (let elem of menuItems) {
        elem.classList.remove("select");
    }

    event.classList.add("select");
}