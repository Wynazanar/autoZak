function changePage(page) {
    switch(page) {
        case "Главная": setHomePage(); break;
        case "Билеты": setTcketsPage(); break;
        case "Рейсы": setRoutesPage(); break;
        case "Автобусы": setBusesPage(); break;
        case "Аналитика": setAnalyticsPage(); break;
        case "Журнал действий": setAuditLogPage(); break;
        default: setHomePage();
    }
}

async function loadLocalStorage() {
    try {
        const response_routes = await fetch('./data/routes.json');
        const response_buses = await fetch('./data/buses.json');
        
        if (!response_routes.ok || !response_buses.ok) {
            throw new Error('Ошибка загрузки!');
        }
        
        const routes = await response_routes.json();
        const buses = await response_buses.json();
        
        const localR = localStorage.getItem("routes");
        const localB = localStorage.getItem("buses");
        
        if (localR == null) {
            localStorage.setItem("routes", JSON.stringify(routes));
            console.log("Начальные рейсы были загружены из ./data/routes.json");
        }
        if (localB == null) {
            localStorage.setItem("buses", JSON.stringify(buses));
            console.log("Начальные рейсы были загружены из ./data/buses.json");
        }

    } catch (error) {
        console.error('Ошибка:', error.message);
    }
}

function setLocalStorage() {
    const data = ["buses", "routes", "audit", "tickets"];
    for (let d of data) {
        if (localStorage.getItem(`${d}`) == null) {
            localStorage.setItem(`${d}`, "[]");
        }
    }
    
}

changePage("Главная");
setLocalStorage();