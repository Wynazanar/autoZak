async function setRoutesPage() {
    let page = document.querySelector("section");

    page.innerHTML = `
    <div>
        <div style="display: flex; align-items: center; justify-content: space-between;">
            <h3>Рейсы</h3>
            <button class="button" onclick="createEditRouteModal(null)">+ Создать</button>
        </div>
        <div class="filters" id="buses_filters">
            <div class="filter-container">
                <input type="date" id="route_date"/>
                <input id="route_ar" list="route_cities" placeholder="Место отправления">
                <input id="route_des" list="route_cities" placeholder="Место прибытия">
                <datalist id="route_cities"></datalist>
            </div>
            <div class="filter-container">
                <input type="text" placeholder="Номер автобуса"/>
                <input type="text" placeholder="Имя водителя"/>
                <button class="button w" onclick="resetRoutesFilters()">Сбросить</button>
                <button class="button" onclick="applyRoutesFilters()">Применить</button>
            </div>
            
        </div>
        <table style="width: 100%; margin-top: 25px;">
            <thead>
                <tr>
                    <th>№</th>
                    <th>Дата и время</th>
                    <th>Пункты</th>
                    <th>Номер автобуса</th>
                    <th>Водитель</th>
                    <th>Количество мест</th>
                    <th>Статус</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody id="route_table"></tbody>
        </table>
    </div>
    
    <div class="modal modal-hide" id="route_modal"></div>
    <div class="modal modal-hide" id="route_ticket_modal"></div>
    `;

    loadCities();
    renderFilteredRoutes(JSON.parse(localStorage.getItem("routes")));
}

function applyRoutesFilters() {
    let routesData = JSON.parse(localStorage.getItem("routes")) || [];
    let dateFilter = document.querySelector('#route_date').value.trim();
    let departureFilter = document.querySelector('#route_ar').value.toLowerCase().trim();
    let arrivalFilter = document.querySelector('#route_des').value.toLowerCase().trim();

    let filteredRoutes = routesData.filter(route => {
        if (dateFilter && !route.date.includes(dateFilter)) return false;

        let foundStops = route.routes.map(stop => stop.destination.toLowerCase());
        let startIndex = foundStops.indexOf(departureFilter);
        let endIndex = foundStops.indexOf(arrivalFilter);

        if (departureFilter && arrivalFilter) {
            return (startIndex !== -1 && endIndex !== -1) && startIndex < endIndex;
        }
        if (departureFilter) return startIndex !== -1;
        if (arrivalFilter) return endIndex !== -1;

        return true;
    });

    renderFilteredRoutes(filteredRoutes);
}

function resetRoutesFilters() {
    document.querySelector('#route_date').value = '';
    document.querySelector('#route_ar').value = '';
    document.querySelector('#route_des').value = '';

    renderFilteredRoutes(JSON.parse(localStorage.getItem("routes")) || []);
}

function renderFilteredRoutes(route) {
    let tableBody = document.querySelector("#route_table");
    let buses = JSON.parse(localStorage.getItem("buses")) || [];
    let body = '';

    if (route.length === 0) {
        body = '<tr><td colspan="8" style="text-align:center;">Нет результатов</td></tr>';
    } else {
        route.forEach((rout, idx) => {
            let bus = buses.find(b => b.id === rout.bus_id);
            body += `
                <tr style="text-align: center;">
                    <td>${rout.id}</td>
                    <td><strong>${rout.date}</strong></br>${rout.routes[0].time[0]} - ${rout.routes[rout.routes.length - 1].time[1]}</td>
                    <td>${rout.routes[0].destination} - ${rout.routes[rout.routes.length - 1].destination}</td>
                    <td>${bus.bus_number}</td>
                    <td>${bus.driver}</td>
                    <td>${bus.sits}</td>
                    <td>${Tag(rout.status[0], rout.status[1])}</td>
                    <td style="text-align:right;"><a 
                                onclick="openTicketModal(${rout.id})"
                                style="color:var(--warning-main); cursor: pointer;">Открыть</a> <a onclick="createEditRouteModal(${rout.id})" style="color:var(--success-main); cursor: pointer;">Редактировать</a> <a onclick="deleteRouteRow('${idx}')" style="color:var(--danger-main); cursor: pointer;">Удалить</a></td>
                </tr>
            `;
        });
    }

    tableBody.innerHTML = body;
}

function loadRouteTable() {
    applyRoutesFilters();
}

function deleteRouteRow(index) {
    if (confirm("Вы уверены, что хотите удалить запись?")) {
        try {
            let data = JSON.parse(localStorage.getItem("routes"));
            data.splice(index, 1);
            localStorage.setItem("routes", JSON.stringify(data));
            Push("success", "Удален", "Рейс был успешно удален.");
            loadRouteTable();
            createNewAudit("route", "delete", Number(index + 1), "success");
        } catch (error) {
            Push("danger", "Ошибка удаления", error.message);
            createNewAudit("route", "delete", Number(index + 1), "failed");
        }
    }
}

function createEditRouteModal(id) {
    let routes = JSON.parse(localStorage.getItem("routes")) || [];
    const buses = JSON.parse(localStorage.getItem("buses")) || [];

    const rout = routes.find(r => r.id === id);

    let routeModal = document.querySelector("#route_modal");
    routeModal.innerHTML = 
    `<div class="modal-content">
            <div class="modal-header">
                <p style="color: var(--text-color)">${rout == null ? "Создание нового рейса" : "Редактирование рейса"}</p>
                <a onclick="closeRouteModal()">
                <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m15 9-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                </svg></a>
            </div>
            <div class="modal-body">
                <div class="modal-form-block">
                    <p>Информация об автобусе</p>
                    <div class="modal-form">
                        <input type="date" id="route_form_date">
                        <select type="text" placeholder="Автобус" id="d_route_bus"></select>
                        <input type="number" id="route_form_price" placeholder="Цена за весь маршрут (₽)" min="0">
                        <select id="route_form_status">
                            <option value="" selected>Создан</option>
                            <option value="warning">Ожидает посадки</option>
                            <option value="success">В пути</option>
                            <option value="succes">Завершен</option>
                            <option value="failed">Отменен</option>
                        </select>
                    </div>
                </div>
                <div class="modal-form-block">
                    <p>Информация о рейсе</p>
                    <div class="modal-form">
                        <input type="time" placeholder="Время прибытия" id="pri">
                        <input type="time" placeholder="Время отправления" id="otp">
                        <input type="text" placeholder="Место названия" id="place" list="route_cities">
                        <button class="button w" onclick="addNewDestinitionInTable()">Добавить</button>
                    </div>
                </div>
                <div class="modal-form" style="overflow-x:auto; max-height: 500px; padding: 8px; height: 500px;">
                    <table style="width: 100%; margin-bottom: 25px; border-radius: 4px; text-align: center;">
                        <thead>
                            <tr>
                                <th>Прибытие</th>
                                <th>Отправление</th>
                                <th>Место назначения</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody id="tbody_route"></tbody>
                    </table>
                </div>
                <button class="button" onclick="saveRoute(${id})">Сохранить</button>
            </div>
        </div>`;
    
    let d_b = document.querySelector("#d_route_bus");
    
    d_b.innerHTML = "<option value='' selected disabled>Выберите автобус</option>";
    for(let db of buses) {
        d_b.innerHTML += `<option value="${db.id}">${db.bus_number} - ${db.driver}</option>`;
    }
    
    if (rout != null) {
        let routeTable = document.querySelector("#tbody_route");
        let rb = ``;
        for (let _rout of rout.routes) {
            rb += createRouteTableRow(_rout.time[0], _rout.time[1], _rout.destination);
        }
        routeTable.innerHTML = rb;
        
        d_b.value = rout.bus_id;
        
        let form_date = document.querySelector("#route_form_date");
        form_date.value = rout.date || null;
        
        let form_status = document.querySelector("#route_form_status");
        form_status.value = rout.status[0] || "";
        
        let form_price = document.querySelector("#route_form_price");
        form_price.value = rout.price || "";
    }
    
    routeModal.classList.toggle("modal-hide");
}

function closeRouteModal() {
    let routeModal = document.querySelector("#route_modal");
    routeModal.classList.toggle("modal-hide");
}

function createRouteTableRow(timeArrival, timeDeparture, destination) {
    return `<tr>
        <td>${timeArrival}</td>
        <td>${timeDeparture}</td>
        <td>${destination}</td>
        <td><a onclick="moveDestinationUp(this)" style="cursor: pointer;">↑</a> <a onclick="moveDestinationDown(this)" style="cursor: pointer;">↓</a> <a onclick="removeDestinationInTable(this)" style="cursor: pointer;">🗑️</a></td>
    </tr>`;
}

function addNewDestinitionInTable() {
    let routeTable = document.querySelector("#tbody_route");
    const t1 = document.querySelector("#pri");
    const t2 = document.querySelector("#otp");
    const d = document.querySelector("#place");

    if (t1.value != "" && t2.value != "" && d.value != "") {
        routeTable.innerHTML += createRouteTableRow(t1.value.trim(), t2.value.trim(), d.value.trim());
        t1.value = "";
        t2.value = "";
        d.value = "";
    } else {
        Push("warning", "Предупреждение", "Заполните все поля");
    }
}

function removeDestinationInTable(target) {
    let row = target.closest('tr');
    if (row) {
        row.remove();
    }
}

function moveDestinationUp(target) {
    let row = target.closest('tr');
    let prevRow = row.previousElementSibling;
    if (prevRow) {
        row.parentNode.insertBefore(row, prevRow);
    }
}

function moveDestinationDown(target) {
    let row = target.closest('tr');
    let nextRow = row.nextElementSibling;
    if (nextRow) {
        row.parentNode.insertBefore(nextRow, row);
    }
}

function saveRoute(id) {
    const route = JSON.parse(localStorage.getItem("routes")) || [];

    let r_bus = document.querySelector("#d_route_bus");
    let r_date = document.querySelector("#route_form_date");
    let r_status = document.querySelector("#route_form_status");
    let r_price = document.querySelector("#route_form_price");

    let stopsTable = document.querySelector("#tbody_route").rows;
    let routesArray = [];

    for (let i = 0; i < stopsTable.length; i++) {
        let row = stopsTable[i];
        let timeArrival = row.cells[0].innerText; 
        let timeDeparture = row.cells[1].innerText; 
        let destination = row.cells[2].innerText;

        routesArray.push({
            time: [timeArrival, timeDeparture],
            destination: destination
        });
    }

    let statusMap = {
        "": "Создан",
        "warning": "Ожидает посадки",
        "success": "В пути",
        "succes": "Завершен",
        "failed": "Отменен"
    };
    
    let statusValue = r_status.value || "";
    let statusText = statusMap[statusValue] || "Создан";
    
    let newRoute = {
        id: id || Math.floor(Math.random() * 999999) + 1,
        bus_id: Number(r_bus.value),
        date: r_date.value,
        price: Number(r_price.value) || 0,
        routes: routesArray,
        status: [statusValue, statusText]
    };

    if (id !== null) {
        let indexToUpdate = route.findIndex(r => r.id === id);
        if (indexToUpdate >= 0) {
            route[indexToUpdate] = newRoute;
        }
    } else {
        route.push(newRoute);
    }

    localStorage.setItem("routes", JSON.stringify(route));
    Push("success", "Сохранено", "Маршрут успешно сохранён!");
    createNewAudit("route", "create", id, "success");
    closeRouteModal();
    loadRouteTable();
}

let citiesCache = null;
let citiesLoaded = false;

function addCitiesToDatalist(datalist, cities) {
    const fragment = document.createDocumentFragment();
    for (let city of cities) {
        const option = document.createElement('option');
        option.value = city.name;
        option.textContent = city.name;
        fragment.appendChild(option);
    }
    datalist.appendChild(fragment);
}

async function loadCities() {
    let datalist = document.querySelector("#route_cities");
    if (!datalist) return;
    
    if (citiesLoaded && datalist.children.length > 0) {
        return;
    }
    
    if (citiesCache) {
        addCitiesToDatalist(datalist, citiesCache);
        citiesLoaded = true;
        return;
    }
    
    try {
        const response = await fetch("./data/cities.json");
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        citiesCache = data;
        addCitiesToDatalist(datalist, data);
        citiesLoaded = true;

    } catch (error) {
        console.error("Ошибка при загрузке:", error.message);
    }
}

function openTicketModal(id) {
    let ticketModal = document.querySelector("#route_ticket_modal");
    
    let routes = JSON.parse(localStorage.getItem("routes")) || [];
    let tickets = JSON.parse(localStorage.getItem("tickets")) || [];
    let route = routes.find(r => r.id === id);
    
    let routeTickets = tickets.filter(t => t.route_id === id);
    
    let routeInfo = '';
    if (route) {
        routeInfo = route.routes[0].destination + ' - ' + route.routes[route.routes.length - 1].destination;
    }
    
    let ticketsTable = '';
    if (routeTickets.length > 0) {
        routeTickets.forEach(ticket => {
            ticketsTable += `
                <tr>
                    <td>${ticket.id}</td>
                    <td>${ticket.passenger_name || '-'}</td>
                    <td>${ticket.passenger_phone || '-'}</td>
                    <td>${ticket.seats ? ticket.seats.join(', ') : '-'}</td>
                    <td>${Tag(ticket.status === 'active' ? 'success' : 'failed', ticket.status === 'active' ? 'Активен' : 'Возвращен')}</td>
                    <td>${ticket.purchase_date ? new Date(ticket.purchase_date).toLocaleDateString() : '-'}</td>
                </tr>
            `;
        });
    } else {
        ticketsTable = '<tr><td colspan="6" style="text-align: center;">Нет купленных билетов для этого рейса</td></tr>';
    }
    
    ticketModal.innerHTML = 
    `<div class="modal-content" style="max-width: 900px;">
        <div class="modal-header">
            <p style="color: var(--text-color)">Билеты рейса №${id}</p>
            <a onclick="closeTicketModal()">
            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m15 9-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
            </svg></a>
        </div>
        <div class="modal-body">
            <div class="modal-form-block">
                <p>Маршрут: ${routeInfo}</p>
                <p>Дата: ${route ? route.date : '-'}</p>
            </div>
            <div class="modal-form-block">
                <table style="width: 100%; margin-top: 15px;">
                    <thead>
                        <tr>
                            <th>№ билета</th>
                            <th>Пассажир</th>
                            <th>Телефон</th>
                            <th>Места</th>
                            <th>Статус</th>
                            <th>Дата покупки</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ticketsTable}
                    </tbody>
                </table>
            </div>
        </div>
    </div>`;

    ticketModal.classList.toggle("modal-hide");
}

function closeTicketModal() {
    let ticketModal = document.querySelector("#route_ticket_modal");
    ticketModal.classList.toggle("modal-hide");
}