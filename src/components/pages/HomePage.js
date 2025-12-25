function setHomePage() {
    let page = document.querySelector("section");
    
    let routes = JSON.parse(localStorage.getItem("routes")) || [];
    let buses = JSON.parse(localStorage.getItem("buses")) || [];
    let tickets = JSON.parse(localStorage.getItem("tickets")) || [];
    let activeTickets = tickets.filter(t => t.status === 'active');
    let totalSeatsSold = tickets.reduce((sum, t) => sum + (t.seats ? t.seats.length : 0), 0);
    let totalRevenue = tickets.reduce((sum, t) => sum + (t.price || 0), 0);
    
    let todayRoutes = routes.filter(r => {
        let today = new Date().toISOString().split('T')[0];
        return r.date === today;
    });
    
    let upcomingRoutes = routes.filter(r => {
        let today = new Date();
        let routeDate = new Date(r.date);
        return routeDate > today;
    }).slice(0, 5);
    
    page.innerHTML = `
        <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                <h3>Главная</h3>
                <div style="display: flex; gap: 10px;">
                    <button class="button w" onclick="changePage('Билеты')">Билеты</button>
                    <button class="button w" onclick="changePage('Рейсы')">Рейсы</button>
                    <button class="button w" onclick="changePage('Автобусы')">Автобусы</button>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 20px;">
                <div style="background: var(--gray_2-100); padding: 20px; border-radius: 4px; border: 1px solid var(--gray_2-70);">
                    <p class="inter_16_m" style="color: var(--primary-main); margin-bottom: 8px;">${routes.length}</p>
                    <p class="inter_14_m" style="color: var(--text-color);">Всего рейсов</p>
                </div>
                <div style="background: var(--gray_2-100); padding: 20px; border-radius: 4px; border: 1px solid var(--gray_2-70);">
                    <p class="inter_16_m" style="color: var(--success-main); margin-bottom: 8px;">${buses.length}</p>
                    <p class="inter_14_m" style="color: var(--text-color);">Автобусов</p>
                </div>
                <div style="background: var(--gray_2-100); padding: 20px; border-radius: 4px; border: 1px solid var(--gray_2-70);">
                    <p class="inter_16_m" style="color: var(--warning-main); margin-bottom: 8px;">${activeTickets.length}</p>
                    <p class="inter_14_m" style="color: var(--text-color);">Активных билетов</p>
                </div>
                <div style="background: var(--gray_2-100); padding: 20px; border-radius: 4px; border: 1px solid var(--gray_2-70);">
                    <p class="inter_16_m" style="color: var(--primary-main); margin-bottom: 8px;">${totalRevenue.toLocaleString()} ₽</p>
                    <p class="inter_14_m" style="color: var(--text-color);">Выручка</p>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px;">
                <div style="background: var(--gray_2-100); padding: 20px; border-radius: 4px; border: 1px solid var(--gray_2-70);">
                    <h3 style="margin-bottom: 15px;">Рейсы на сегодня</h3>
                    ${todayRoutes.length > 0 ? `
                        <table style="width: 100%;">
                            <thead>
                                <tr>
                                    <th>№</th>
                                    <th>Маршрут</th>
                                    <th>Время</th>
                                    <th>Статус</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${todayRoutes.slice(0, 5).map(r => `
                                    <tr>
                                        <td>${r.id}</td>
                                        <td>${r.routes[0].destination} - ${r.routes[r.routes.length - 1].destination}</td>
                                        <td>${r.routes[0].time[0]}</td>
                                        <td>${Tag(r.status[0] || 'success', r.status[1] || 'Создан')}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<p style="color: var(--text-color);">Нет рейсов на сегодня</p>'}
                </div>
                
                <div style="background: var(--gray_2-100); padding: 20px; border-radius: 4px; border: 1px solid var(--gray_2-70);">
                    <h3 style="margin-bottom: 15px;">Ближайшие рейсы</h3>
                    ${upcomingRoutes.length > 0 ? `
                        <table style="width: 100%;">
                            <thead>
                                <tr>
                                    <th>№</th>
                                    <th>Маршрут</th>
                                    <th>Дата</th>
                                    <th>Время</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${upcomingRoutes.map(r => `
                                    <tr>
                                        <td>${r.id}</td>
                                        <td>${r.routes[0].destination} - ${r.routes[r.routes.length - 1].destination}</td>
                                        <td>${r.date}</td>
                                        <td>${r.routes[0].time[0]}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<p style="color: var(--text-color);">Нет предстоящих рейсов</p>'}
                </div>
            </div>
        </div>
    `;
}