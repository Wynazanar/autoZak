const icons = [
    "home", "tickets", "map", "car", "circle-quarter", "list-square",
]

const items = {
    "home": "Главная",
    "tickets": "Билеты",
    "map": "Рейсы",
    "car": "Автобусы",
    "circle-quarter": "Аналитика",
    "list-square": "Журнал действий",
}

function Sidebar() {
    sidebar = document.querySelector(".sidebar");
    sidebar.innerHTML += getHeader();
    sidebar.innerHTML += getFooter();
}

function getHeader() {
    return (`
        <header>
            <i class="bx bx-school"></i>
            <span>Автовокзал</span></br>
            <span>Система управления</span>
            ${getNavigations()}
        </header>
    `);
}

function getNavigations() {
    let body = `<div class="nav"><ul class="nav-links">`;

    for (let item of icons) {
        body += `<li class="nav-link" onclick="changePage('${item}')">${menuItem(item, items[item])}</li>`;
    }

    return body;
}

function getFooter() {
    return (`
        <footer>
            <i class="bx bx-sun"></i>
            <span>Светлая тема</span>
            ${Switch(false)}
        </footer>
    `);
}

Sidebar();