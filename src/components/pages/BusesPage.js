function setBusesPage() {
    let page = document.querySelector("section");

    page.innerHTML = `
    <div>
        <div style="display: flex; align-items: center; justify-content: space-between;">
            <h3>Автобусы</h3>
            <button class="button" onclick="openBusModal()">+ Создать</button>
        </div>
        <div id="buses_filters" style="margin-block: 20px; display: flex; gap: 10px; background: var(--gray_2-100); border-radius: 4px; padding: 15px">
            <input type="text" placeholder="Номер автобуса" id="busNumberFilter"/>
            <input type="text" placeholder="Имя водителя" id="driverNameFilter"/>
            <button class="button w" onclick="applyFilters()">Применить фильтр</button>
        </div>
        <table style="width: 100%; margin-top: 25px;">
            <thead>
                <tr>
                    <th>№</th>
                    <th>Номер автобуса</th>
                    <th>Водитель</th>
                    <th>Количество мест</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody id="buses_table"></tbody>
        </table>
    </div>
    <div class="modal modal-hide" id="bus_create_modal">
        <div class="modal-content">
            <div class="modal-header">
                <p>Создание нового автобуса</p>
                <a onclick="openBusModal()">
                <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m15 9-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                </svg></a>
            </div>
            <div class="modal-body">
                <div class="modal-form-block">
                    <div class="modal-form">
                        <div>
                            <input type="text" placeholder="Номер автобуса" id="bus_number">
                            <input type="text" placeholder="Количество мест" id="bus_sits">
                        </div>
                        <input type="text" placeholder="Водитель" id="bus_driver">
                    </div>
                </div>
                <button class="button" onclick="saveNewBus()">Сохранить</button>
            </div>
        </div>
    </div>
    `;

    loadBusTable();
}

function applyFilters() {
    let buses = JSON.parse(localStorage.getItem("buses")) || [];
    let filteredBuses = buses.filter(bus => {
        let busNumberFilter = document.querySelector('#busNumberFilter').value;
        let driverNameFilter = document.querySelector('#driverNameFilter').value.toLowerCase().trim();

        if (busNumberFilter) {
            if (!bus.bus_number.toLowerCase().includes(busNumberFilter)) return false;
        }

        if (driverNameFilter) {
            if (!bus.driver.toLowerCase().includes(driverNameFilter)) return false;
        }

        return true;
    });

    renderFilteredBuses(filteredBuses);
}

function renderFilteredBuses(buses) {
    let tableBody = document.querySelector("#buses_table");
    let body = '';

    if (buses.length === 0) {
        body = '<tr><td colspan="5" style="text-align:center;">Нет результатов</td></tr>';
    } else {
        buses.forEach((bus, idx) => {
            body += `
                <tr style="text-align: center;">
                    <td>${idx + 1}</td>
                    <td>${bus.bus_number}</td>
                    <td>${bus.driver}</td>
                    <td>${bus.sits}</td>
                    <td style="text-align:right;"><a onclick="deleteRow('${idx}')" style="color:var(--danger-main); cursor: pointer;">Удалить</a></td>
                </tr>
            `;
        });
    }

    tableBody.innerHTML = body;
}

function loadBusTable() {
    applyFilters();
}

function deleteRow(index) {
    if (confirm("Вы уверены, что хотите удалить запись?")) {
        try {
            let data = JSON.parse(localStorage.getItem("buses"));
            data.splice(index, 1);
            localStorage.setItem("buses", JSON.stringify(data));
            Push("success", "Удален", "Автобус был успешно удален.");
            loadBusTable();
            createNewAudit("bus", "delete", Number(index + 1), "success");
        } catch (error) {
            Push("danger", "Ошибка удаления", error.message);
            createNewAudit("bus", "delete", Number(index + 1), "failed");
        }
    }
}

function openBusModal() {
    let modal = document.querySelector("#bus_create_modal");
    modal.classList.toggle("modal-hide");
}

function saveNewBus() {
    let bus_number = document.querySelector("#bus_number"),
        bus_driver = document.querySelector("#bus_driver"),
        bus_sits = document.querySelector("#bus_sits");

    if (bus_number.value.trim() !== "" && bus_sits.value.trim() !== "" && bus_driver.value.trim() !== "") {
        try {
            let buses = JSON.parse(localStorage.getItem("buses")) || [];

            let newBus = {
                id: buses.length + 1,
                bus_number: bus_number.value.trim(),
                driver: bus_driver.value.trim(),
                sits: bus_sits.value.trim()
            };

            createNewAudit("bus", "create", newBus.id, "success");
            buses.push(newBus);
            localStorage.setItem("buses", JSON.stringify(buses));
            
            Push("success", "Автобус сохранён", `Новый автобус - ${bus_number.value.trim()} успешно добавлен.`);
            
            bus_number.value = "";
            bus_driver.value = "";
            bus_sits.value = "";
            
            loadBusTable();
            openBusModal();
        } catch (error) {
            Push("danger", "Ошибка создания", error.message);
            createNewAudit("bus", "create", "-", "failed");
        }
    } else {
        Push("warning", "Внимание", "Заполните все необходимые поля!");
    }
}