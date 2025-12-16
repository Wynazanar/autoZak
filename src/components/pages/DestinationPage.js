async function setRoutesPage() {
    try {
        // Загружаем маршруты и автобусы
        const response_routes = await fetch('./data/routes.json');
        const response_buses = await fetch('./data/buses.json');
        
        if (!response_routes.ok || !response_buses.ok) {
            throw new Error('Ошибка загрузки!');
        }
        
        const routes = await response_routes.json();
        const buses = await response_buses.json(); 
        
        let page = document.querySelector('section');
        page.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 25px">
                <h3>Рейсы</h3>
                ${Button("+ Добавить рейс", "createRouteModal()")}
            </div>
            ${getTable(routes, buses)}
        `;
    } catch(error) {
        console.error('Ошибка:', error.message);
    }
}

function getTable(data, buses) {
    let rows = '';
    for (let route of data) {
        const bus = buses.find(bus => bus.id === route.bus_id);
        rows += `
            <tr>
                <td>${bus.bus_number}</td>
                <td>${route.routes[0].time[0]} - ${route.routes[route.routes.length - 1].time[1]}</td>
                <td>${route.routes[0].destination} - ${route.routes[route.routes.length - 1].destination}</td>
                <td>${bus.driver}</td>
                <td>${bus.sits}</td>
                <td>${Tag("success", "Ожидает")}</td>
            </tr>
        `;
    }

    return `
        <table>
            <thead>
                <tr>
                    <th>Автобус №</th>
                    <th>Время отправления / прибытия</th>
                    <th>Направление</th>
                    <th>Водитель</th>
                    <th>Количество мест</th>
                    <th>Статус</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
}


function createRouteModal() {
    let modal = document.querySelector("routeModal");
    modal.classList.remove("modal-hide");
}

function closeRouteModal() {
    let modal = document.querySelector("routeModal");
    modal.classList.toggle("modal-hide");
}

function addNewDestinition() {
    let table = document.querySelector('#tbody'),
        pr = document.querySelector('#pri'),
        ot = document.querySelector('#otp'),
        place = document.querySelector('#place');

    if (pr.value !="" && ot.value != "" && place.value != "") {
        table.innerHTML += 
        `<tr>
            <td>${document.querySelector('#pri').value}</td>
            <td>${document.querySelector('#otp').value}</td>
            <td>${document.querySelector('#place').value}</td>
        </tr>`;                    

        pr.value = "";
        ot.value = "";
        place.value = "";
    }
}

function saveDestination() {
    console.log("Новый рейс сохранен");
}