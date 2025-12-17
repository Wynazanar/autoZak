async function setRoutesPage() {
    try {
        const response_routes = await fetch('./data/routes.json');
        const response_buses = await fetch('./data/buses.json');
        
        if (!response_routes.ok || !response_buses.ok) {
            throw new Error('Ошибка загрузки!');
        }
        
        const routes = await response_routes.json();
        const buses = await response_buses.json(); 
        
        const localR = localStorage.getItem("routes");
        
        if (localR == null) {
            localStorage.setItem("routes", JSON.stringify(routes));
            console.log("Начальные рейсы были загружены из ./data/routes.json");
        }

        let page = document.querySelector('section');
        page.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 25px">
                <h3>Рейсы</h3>
                ${Button("+ Добавить рейс", "createRouteModal()")}
            </div>
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
                <tbody id="routeTable"></tbody>
            </table>
        `;
        getTable(JSON.parse(localR), buses);
    } catch(error) {
        console.error('Ошибка:', error.message);
    }
}

function getTable(data, buses) {
    let body = document.querySelector('#routeTable');
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
                <td>${Tag(route.status[0], route.status[1])}</td>
            </tr>
        `;
    }
    body.innerHTML += rows;
}


function createRouteModal() {
    let modal = document.querySelector(".modal");
    modal.classList.remove("modal-hide");

    loadCities();
}

function closeRouteModal() {
    let modal = document.querySelector(".modal");
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
    try {
        let json = JSON.parse(localStorage.getItem("routes"));
        console.log(json);


        let data = `{
            "id": ${json.length}, 
            "bus_id": ${2},
            "status": ["", "Создан"]
            
        }`;

        // json.push(JSON.parse(data));
        // localStorage.setItem("routes", JSON.stringify(json));
        console.log(data);
    } catch (error) {
        console.error(error);
    };
}

let citiesCache = null;
let citiesLoaded = false;

async function loadCities() {
    let datalist = document.querySelector("#datalist");
    if (!datalist) return;
    
    // Если города уже загружены, не загружаем повторно
    if (citiesLoaded && datalist.children.length > 0) {
        return;
    }
    
    // Если данные уже в кэше, используем их
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
        citiesCache = data; // Сохраняем в кэш
        
        // Используем DocumentFragment для оптимизации - создаём все элементы в памяти
        // и добавляем их одним разом, вместо множественных обновлений DOM
        const fragment = document.createDocumentFragment();
        
        for (let city of data) {
            const option = document.createElement('option');
            option.value = city.name;
            option.textContent = city.name;
            fragment.appendChild(option);
        }
        
        // Добавляем все элементы одним разом
        datalist.appendChild(fragment);
        citiesLoaded = true;

    } catch (error) {
        console.error("Ошибка при загрузке:", error.message);
    }
}