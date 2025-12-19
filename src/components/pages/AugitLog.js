function setAuditLogPage() {
    let page = document.querySelector("section");
    
    page.innerHTML = `
    <div>
        <div style="display: flex; align-items: center; justify-content: space-between;">
            <h3>Журнал действий</h3>
        </div>
        <div id="audit_filters" style="margin-block: 20px; display: flex; gap: 10px; background: var(--gray_2-100); border-radius: 4px; padding: 15px">
            <input type="date" placeholder="Дата и время">
            <input type="text" placeholder="Пользователь">
            <input type="text" placeholder="Тип">
            <input type="text" placeholder="Действие">
            <input type="text" placeholder="Статус">
            <button class="button w" onclick="applyAuditFilters()">Применить фильтр</button>
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
}

function renderFilteredAudits(audits) {
    let tableBody = document.querySelector("#audit_table");
    let body = '';

    if (audits.length === 0) {
        body = '<tr><td colspan="5" style="text-align:center;">Нет результатов</td></tr>';
    } else {
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
                    <td>${audit.status || "-"}</td>
                </tr>
            `;
        });
    }

    tableBody.innerHTML = body;
}

const types = {
    "bus": "Автобусы"
}

const actions = {
    "create": "Создание",
    "delete": "Удаление",
}