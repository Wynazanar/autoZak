const icons = {
    `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"/></svg>`, "tickets", "map", "car", "circle-quarter", "list-square",
}

const items = [
    "Главная",
    "Билеты",
    "Рейсы",
    "Автобусы",
    "Аналитика",
    "Журнал действий",
]

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

    for (let item of items) {
        body += `<li class="nav-link" onclick="changePage('${item}')">${menuItem(item, item)}</li>`;
    }

    return body;
}

function getFooter() {
    let theme = localStorage.getItem("theme");
    let checked = false;
    if (theme == "dark") {
        checked = true;
    }

    return (`
        <footer onclick="changeTheme()">
            <i class="bx bx-sun"></i>
            <span>Светлая тема</span>
            ${Switch(checked)}
        </footer>
    `);
}

Sidebar();