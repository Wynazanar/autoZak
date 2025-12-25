async function setTcketsPage() {
    let page = document.querySelector('section');
    page.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 25px">
            <h3>Билеты</h3>
            <button class="button" onclick="showAllTickets()">Билеты</button>
        </div>
        ${getFilters()}
        <table style="width: 100%; margin-top: 25px;">
            <thead>
                <tr>
                    <th>№</th>
                    <th>Дата и время</th>
                    <th>Рейс</th>
                    <th>Автобус</th>
                    <th>Свободных мест</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody id="tbody_tickets"></tbody>
        </table>
    `;
    
    await setCities();
}

function getFilters() {
    return (`
        <div style="margin-block: 20px; display: flex; gap: 10px; background: var(--gray_2-100); border-radius: 4px; padding: 15px; align-items: center;">
            <input id="tickets_date" type="date" placeholder="Дата отправления">
            <input id="tickets_arrival" type="text" placeholder="Место отправления" list="cities_datalist">
            <input id="tickets_destination" type="text" placeholder="Место прибытия" list="cities_datalist">
            <datalist id="cities_datalist"></datalist>
            ${Button("Найти", "searchTickets()")}
        </div>
    `);
}

async function setCities() {
    let datalist = document.querySelector("#cities_datalist");
    if (!datalist) return;
    
    if (citiesLoaded && datalist.children.length > 0) {
        return;
    }
    
    if (citiesCache) {
        const fragment = document.createDocumentFragment();
        for (let city of citiesCache) {
            const option = document.createElement('option');
            option.value = city.name;
            option.textContent = city.name;
            fragment.appendChild(option);
        }
        datalist.appendChild(fragment);
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
        const fragment = document.createDocumentFragment();
        
        for (let city of data) {
            const option = document.createElement('option');
            option.value = city.name;
            option.textContent = city.name;
            fragment.appendChild(option);
        }
        
        datalist.appendChild(fragment);
        citiesLoaded = true;

    } catch (error) {
        console.error("Ошибка при загрузке:", error.message);
    }
}

function searchTickets() {
    let table = document.querySelector("#tbody_tickets");
    let dateInput = document.querySelector("#tickets_date").value.trim();
    let arrivalCity = document.querySelector("#tickets_arrival").value.trim();
    let destinationCity = document.querySelector("#tickets_destination").value.trim();
    
    table.innerHTML = '';

    let routesData = localStorage.getItem("routes");
    let routes = JSON.parse(routesData) || [];
    let buses = JSON.parse(localStorage.getItem("buses")) || [];
    let tickets = JSON.parse(localStorage.getItem("tickets")) || [];

    let filteredRoutes = routes.filter(route => {
        let startIndex = route.routes.findIndex(stop => stop.destination === arrivalCity);
        let endIndex = route.routes.findIndex(stop => stop.destination === destinationCity);
        
        if(!dateInput) {
            return startIndex >= 0 && endIndex > startIndex;
        }
        return startIndex >= 0 && endIndex > startIndex && route.date === dateInput;
    });

    filteredRoutes.forEach(route => {
        let bus = buses.find(b => b.id === route.bus_id);
        let routeTickets = tickets.filter(t => t.route_id === route.id && t.status === 'active');
        let occupiedSeats = routeTickets.reduce((sum, t) => sum + (t.seats ? t.seats.length : 0), 0);
        let freeSeats = (bus ? bus.sits : 0) - occupiedSeats;
        
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${route.id}</td>
            <td>${route.date} ${route.routes[0].time[0]}</td>
            <td>${arrivalCity} - ${destinationCity}</td>
            <td>${bus ? bus.bus_number : '-'}</td>
            <td>${freeSeats}</td>
            <td><button class="button w" onclick="openBuyTicketModal(${route.id}, '${arrivalCity}', '${destinationCity}')">Купить билеты</button></td>
        `;
        table.appendChild(row);
    });

    if(filteredRoutes.length === 0){
        table.innerHTML = `<tr><td colspan="6" style="text-align: center;">Нет доступных рейсов.</td></tr>`;
    }
}

function openBuyTicketModal(routeId, arrivalCity, destinationCity) {
    let modal = document.querySelector("#buy_ticket_modal");
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal modal-hide';
        modal.id = 'buy_ticket_modal';
        document.body.appendChild(modal);
    }
    
    let routes = JSON.parse(localStorage.getItem("routes")) || [];
    let buses = JSON.parse(localStorage.getItem("buses")) || [];
    let tickets = JSON.parse(localStorage.getItem("tickets")) || [];
    
    let route = routes.find(r => r.id === routeId);
    let bus = buses.find(b => b.id === route.bus_id);
    let routeTickets = tickets.filter(t => t.route_id === routeId && t.status === 'active');
    let occupiedSeats = routeTickets.reduce((acc, t) => {
        if (t.seats) {
            t.seats.forEach(seat => acc.add(seat));
        }
        return acc;
    }, new Set());
    
    let startIndex = route.routes.findIndex(stop => stop.destination === arrivalCity);
    let endIndex = route.routes.findIndex(stop => stop.destination === destinationCity);
    let totalStops = route.routes.length;
    let selectedStops = endIndex - startIndex;
    let routePrice = route.price || 0;
    let calculatedPrice = Math.round((routePrice / totalStops) * selectedStops);
    
    let seatsGrid = '';
    for (let i = 1; i <= bus.sits; i++) {
        let isOccupied = occupiedSeats.has(i);
        seatsGrid += `<button class="seat-btn ${isOccupied ? 'occupied' : ''}" ${isOccupied ? 'disabled' : `onclick="toggleSeat(${i})"`} data-seat="${i}">${i}</button>`;
    }
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
                <p style="color: var(--text-color)">Покупка билетов</p>
                <a onclick="closeBuyTicketModal()">
                <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m15 9-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                </svg></a>
            </div>
            <div class="modal-body">
                <div class="modal-form-block">
                    <p>Рейс: ${arrivalCity} - ${destinationCity}</p>
                    <p>Дата: ${route.date}</p>
                    <p>Автобус: ${bus.bus_number}</p>
                    <p style="font-weight: 600; color: var(--primary-main); margin-top: 10px;">Цена за место: ${calculatedPrice} ₽</p>
                </div>
                <div class="modal-form-block">
                    <p>Выберите места:</p>
                    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; max-height: 400px; overflow-y: auto; padding: 10px; background: var(--gray_2-90); border-radius: 4px;" id="seats_container">
                        ${seatsGrid}
                    </div>
                    <p style="margin-top: 10px; font-size: 12px;">Выбрано мест: <span id="selected_seats_count">0</span></p>
                </div>
                <div class="modal-form-block" id="passengers_data_container">
                    <p>Данные пассажиров:</p>
                </div>
                <button class="button" onclick="buyTickets(${routeId})">Купить</button>
            </div>
        </div>
    `;
    
    modal.classList.remove("modal-hide");
    window.selectedSeats = new Set();
    window.currentRouteId = routeId;
    window.currentArrivalCity = arrivalCity;
    window.currentDestinationCity = destinationCity;
}

function toggleSeat(seatNumber) {
    if (!window.selectedSeats) window.selectedSeats = new Set();
    
    let seatBtn = document.querySelector(`[data-seat="${seatNumber}"]`);
    let container = document.querySelector("#passengers_data_container");
    
    if (seatBtn.classList.contains('selected')) {
        seatBtn.classList.remove('selected');
        window.selectedSeats.delete(seatNumber);
        
        let passengerBlock = document.querySelector(`#passenger_block_${seatNumber}`);
        if (passengerBlock) {
            passengerBlock.remove();
        }
    } else {
        seatBtn.classList.add('selected');
        window.selectedSeats.add(seatNumber);
        
        let passengerBlock = document.createElement('div');
        passengerBlock.id = `passenger_block_${seatNumber}`;
        passengerBlock.style.cssText = 'margin-top: 15px; padding: 15px; background: var(--gray_2-90); border-radius: 4px; border: 1px solid var(--gray_2-70);';
        let routes = JSON.parse(localStorage.getItem("routes")) || [];
        let route = routes.find(r => r.id === window.currentRouteId);
        let arrivalCity = window.currentArrivalCity;
        let destinationCity = window.currentDestinationCity;
        
        let startIndex = route.routes.findIndex(stop => stop.destination === arrivalCity);
        let endIndex = route.routes.findIndex(stop => stop.destination === destinationCity);
        let totalStops = route.routes.length;
        let selectedStops = endIndex - startIndex;
        let routePrice = route.price || 0;
        let calculatedPrice = Math.round((routePrice / totalStops) * selectedStops);
        
        passengerBlock.innerHTML = `
            <p style="font-weight: 600; margin-bottom: 10px; color: var(--text-color);">Место ${seatNumber} - ${calculatedPrice} ₽</p>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <input type="text" id="passenger_name_${seatNumber}" placeholder="ФИО пассажира" style="flex: 1; min-width: 200px;">
                <input type="text" id="passenger_phone_${seatNumber}" placeholder="Телефон" style="flex: 1; min-width: 200px;">
            </div>
        `;
        container.appendChild(passengerBlock);
    }
    
    document.querySelector("#selected_seats_count").textContent = window.selectedSeats.size;
}

function closeBuyTicketModal() {
    let modal = document.querySelector("#buy_ticket_modal");
    if (modal) {
        modal.classList.add("modal-hide");
    }
    window.selectedSeats = new Set();
    let container = document.querySelector("#passengers_data_container");
    if (container) {
        let blocks = container.querySelectorAll('[id^="passenger_block_"]');
        blocks.forEach(block => block.remove());
    }
}

function buyTickets(routeId) {
    if (!window.selectedSeats || window.selectedSeats.size === 0) {
        Push("warning", "Внимание", "Выберите хотя бы одно место");
        return;
    }
    
    let routes = JSON.parse(localStorage.getItem("routes")) || [];
    let route = routes.find(r => r.id === routeId);
    let arrivalCity = window.currentArrivalCity;
    let destinationCity = window.currentDestinationCity;
    
    let startIndex = route.routes.findIndex(stop => stop.destination === arrivalCity);
    let endIndex = route.routes.findIndex(stop => stop.destination === destinationCity);
    let totalStops = route.routes.length;
    let selectedStops = endIndex - startIndex;
    let routePrice = route.price || 0;
    let calculatedPrice = Math.round((routePrice / totalStops) * selectedStops);
    
    let tickets = JSON.parse(localStorage.getItem("tickets")) || [];
    let seatsArray = Array.from(window.selectedSeats);
    let allFilled = true;
    
    for (let seat of seatsArray) {
        let nameInput = document.querySelector(`#passenger_name_${seat}`);
        let phoneInput = document.querySelector(`#passenger_phone_${seat}`);
        
        if (!nameInput || !phoneInput) {
            allFilled = false;
            break;
        }
        
        let passengerName = nameInput.value.trim();
        let passengerPhone = phoneInput.value.trim();
        
        if (!passengerName || !passengerPhone) {
            allFilled = false;
            break;
        }
    }
    
    if (!allFilled) {
        Push("warning", "Внимание", "Заполните данные для всех выбранных мест");
        return;
    }
    
    let totalPrice = 0;
    for (let seat of seatsArray) {
        let nameInput = document.querySelector(`#passenger_name_${seat}`);
        let phoneInput = document.querySelector(`#passenger_phone_${seat}`);
        
        let passengerName = nameInput.value.trim();
        let passengerPhone = phoneInput.value.trim();
        
        let newTicket = {
            id: Math.floor(Math.random() * 999999) + 1,
            route_id: routeId,
            seats: [seat],
            passenger_name: passengerName,
            passenger_phone: passengerPhone,
            from_city: arrivalCity,
            to_city: destinationCity,
            price: calculatedPrice,
            purchase_date: new Date().toISOString(),
            status: 'active'
        };
        
        tickets.push(newTicket);
        totalPrice += calculatedPrice;
        createNewAudit("ticket", "buy", newTicket.id, "success");
    }
    
    localStorage.setItem("tickets", JSON.stringify(tickets));
    Push("success", "Успешно", `Билеты успешно куплены (${seatsArray.length} шт., ${totalPrice} ₽)`);
    closeBuyTicketModal();
    searchTickets();
}

function showAllTickets() {
    let page = document.querySelector('section');
    page.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 25px">
            <h3>Билеты</h3>
            <button class="button w" onclick="setTcketsPage()">Назад к поиску</button>
        </div>
        <table style="width: 100%; margin-top: 25px;">
            <thead>
                <tr>
                    <th>№ билета</th>
                    <th>Рейс</th>
                    <th>Дата</th>
                    <th>Места</th>
                    <th>Пассажир</th>
                    <th>Телефон</th>
                    <th>Статус</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody id="my_tickets_table"></tbody>
        </table>
    `;
    
    let tickets = JSON.parse(localStorage.getItem("tickets")) || [];
    let routes = JSON.parse(localStorage.getItem("routes")) || [];
    let buses = JSON.parse(localStorage.getItem("buses")) || [];
    
    let table = document.querySelector("#my_tickets_table");
    table.innerHTML = '';
    
    tickets.forEach(ticket => {
        let route = routes.find(r => r.id === ticket.route_id);
        let bus = buses.find(b => b.id === (route ? route.bus_id : null));
        
        if (route) {
            let routeInfo = route.routes[0].destination + ' - ' + route.routes[route.routes.length - 1].destination;
            let row = document.createElement("tr");
            row.innerHTML = `
                <td>${ticket.id}</td>
                <td>${routeInfo}</td>
                <td>${route.date}</td>
                <td>${ticket.seats ? ticket.seats.join(', ') : '-'}</td>
                <td>${ticket.passenger_name || '-'}</td>
                <td>${ticket.passenger_phone || '-'}</td>
                <td>${Tag(ticket.status === 'active' ? 'success' : 'failed', ticket.status === 'active' ? 'Активен' : 'Возвращен')}</td>
                <td>
                    ${ticket.status === 'active' ? `<a onclick="returnTicket(${ticket.id})" style="color:var(--danger-main); cursor: pointer;">Вернуть</a>` : '-'}
                </td>
            `;
            table.appendChild(row);
        }
    });
    
    if (tickets.length === 0) {
        table.innerHTML = `<tr><td colspan="8" style="text-align: center;">У вас нет билетов</td></tr>`;
    }
}

function returnTicket(ticketId) {
    if (!confirm("Вы уверены, что хотите вернуть билет?")) {
        return;
    }
    
    let tickets = JSON.parse(localStorage.getItem("tickets")) || [];
    let ticket = tickets.find(t => t.id === ticketId);
    
    if (ticket && ticket.status === 'active') {
        ticket.status = 'returned';
        ticket.return_date = new Date().toISOString();
        localStorage.setItem("tickets", JSON.stringify(tickets));
        
        createNewAudit("ticket", "return", ticketId, "success");
        Push("success", "Успешно", "Билет успешно возвращен");
        showAllTickets();
    }
}