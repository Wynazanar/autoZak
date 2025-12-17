async function setTcketsPage() {
    let page = document.querySelector('section');
    page.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 25px">
            <h3>Билеты</h3>
        </div>
        ${getFilters()}
        <table>
            <thead>
            
            </thead>
            <tbody id="tbody_tickets"></tbody>
        </table>
    `;
    
    await setCities();
}

function getFilters() {
    return (`
        <div class="filter-content">
            <input id="tickets_date" type="date" placeholder="Дата отправления">
            <input id="tickets_arrival" type="text" placeholder="Место отправления" list="cities_datalist">
            <input id="tickets_destination" type="text" placeholder="Место прибытия" list="cities_datalist">
            <datalist id="cities_datalist"></datalist>
            ${Button("Найти", "searchTickets()")}
        <div>
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

    console.log(dateInput);
    console.log(arrivalCity);
    console.log(destinationCity);
    
    while(table.firstChild) {
        table.removeChild(table.lastChild);
    }

    let routesData = localStorage.getItem("routes");

    let routes = JSON.parse(routesData);

    let filteredRoutes = routes.filter(route => {
        let startIndex = route.routes.findIndex(stop => stop.destination === arrivalCity);
        let endIndex = route.routes.findIndex(stop => stop.destination === destinationCity);
        return startIndex >= 0 && endIndex >= 0 && startIndex < endIndex && route.date === dateInput;
    });

    filteredRoutes.forEach(route => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${route.id}</td>
            <td>${route.date}</td>
            <td>${arrivalCity}</td>
            <td>${destinationCity}</td>
            <td>${route.price}</td>
        `;
        table.appendChild(row);
    });

    if(filteredRoutes.length === 0){
        alert("По вашему запросу ничего не нашлось");
    }
}