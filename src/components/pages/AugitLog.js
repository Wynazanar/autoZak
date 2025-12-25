function setAuditLogPage() {
    let page = document.querySelector("section");
    
    page.innerHTML = `
    <div>
        <div style="display: flex; align-items: center; justify-content: space-between;">
            <h3>Журнал действий</h3>
        </div>
        <div id="audit_filters" style="margin-block: 20px; display: flex; gap: 10px; background: var(--gray_2-100); border-radius: 4px; padding: 15px; align-items: center;">
            <input type="date" placeholder="Дата и время" id="audit_data">
            <input type="text" placeholder="Пользователь" id="audit_user">
            <select type="text" placeholder="Тип" id="audit_type">
                <option value="" selected>Все типы</option>
            </select>
            <select placeholder="Действие" id="audit_action">
                <option value="" selected>Все действия</option>
            </select>
            <select placeholder="Статус" id="audit_status">
                <option value="">Все статусы</option>
                <option value="success">Успешно</option>
                <option value="failed">Ошибка</option>
            </select>
            <button class="button w" onclick="resetAuditFilters()">Cбросить</button>
            <button class="button" onclick="applyAuditFilters()">Применить</button>
        </div>
        <table style="width: 100%; margin-top: 25px;">
            <thead>
                <tr>
                    <th>Дата и время</th>
                    <th>Пользователь</th>
                    <th>Тип</th>
                    <th>Действие</th>
                    <th>ID</th>
                    <th>Статус</th>
                </tr>
            </thead>
            <tbody id="audit_table"></tbody>
        </table>
    </div>`;

    renderFilteredAudits(JSON.parse(localStorage.getItem("audit")));
    fillSelects();
}

function renderFilteredAudits(audits) {
    let tableBody = document.querySelector("#audit_table");
    let body = '';

    if (audits.length === 0) {
        body = '<tr><td colspan="5" style="text-align:center;">Нет результатов</td></tr>';
    } else {
        audits.reverse();
        audits.forEach((audit) => {

            const date = new Date(audit.date);

            const formatter = new Intl.DateTimeFormat('ru-RU', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            const localizedDate = formatter.format(date);

            body += `
                <tr style="text-align: center;">
                    <td>${localizedDate}</td>
                    <td>${audit.user || "-"}</td>
                    <td>${types[audit.type] || audit.type || "-"}</td>
                    <td>${actions[audit.action] || audit.action || "-"}</td>
                    <td>${audit.entity || "-"}</td>
                    <td>${Tag(audit.status, audit.status === "success" ? "Успешно" : "Ошибка")}</td>
                </tr>
            `;
        });
    }

    tableBody.innerHTML = body;
}

const types = {
    "bus": "Автобусы",
    "route": "Рейсы",
    "ticket": "Билеты",
}

const actions = {
    "create": "Создание",
    "delete": "Удаление",
    "edit": "Редактирование",
}

function fillSelects() {
    let actionsSelect = document.querySelector("#audit_action");
    let sel = ``;
    
    for (let a in actions) {
        sel += `<option value="${a}">${actions[a]}</option>`;
    }

    actionsSelect.innerHTML += sel;

    let typesSelect = document.querySelector("#audit_type");
    let selT = ``;
    
    for (let t in types) {
        selT += `<option value="${t}">${types[t]}</option>`;
    }

    typesSelect.innerHTML += selT;
}

function applyAuditFilters() {
    let audit = JSON.parse(localStorage.getItem("audit")) || [];
    let filteredAudit = audit.filter(aud => {
        let auditDataFilter = document.querySelector('#audit_data').value;
        let auditTypeFilter = document.querySelector('#audit_type').value;
        let auditActionFilter = document.querySelector('#audit_action').value;
        let auditStatusFilter = document.querySelector('#audit_status').value;
        console.log(auditStatusFilter);
        if (auditDataFilter) {
            if (!aud.date.toLowerCase().includes(auditDataFilter)) return false;
        }
        if (auditActionFilter) {
            if (!aud.action.toLowerCase().includes(auditActionFilter)) return false;
        }
        if (auditTypeFilter) {
            if (!aud.type.toLowerCase().includes(auditTypeFilter)) return false;
        }
        if (auditStatusFilter) {
            if (!aud.status.includes(auditStatusFilter)) return false;
        }

        return true;
    });

    renderFilteredAudits(filteredAudit);
}

function resetAuditFilters() {
    document.querySelector('#audit_data').value = '';
    document.querySelector('#audit_user').value = '';
    document.querySelector('#audit_type').value = '';
    document.querySelector('#audit_action').value = '';
    document.querySelector('#audit_status').value = '';

    renderFilteredAudits(JSON.parse(localStorage.getItem("audit")) || []);
}