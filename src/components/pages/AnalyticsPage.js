function setAnalyticsPage() {
    let page = document.querySelector("section");
    
    let tickets = JSON.parse(localStorage.getItem("tickets")) || [];
    let routes = JSON.parse(localStorage.getItem("routes")) || [];
    let buses = JSON.parse(localStorage.getItem("buses")) || [];
    
    let activeTickets = tickets.filter(t => t.status === 'active');
    let returnedTickets = tickets.filter(t => t.status === 'returned');
    let totalSold = activeTickets.length + returnedTickets.length;
    let totalSeatsSold = tickets.reduce((sum, t) => sum + (t.seats ? t.seats.length : 0), 0);
    let totalRevenue = tickets.reduce((sum, t) => sum + (t.price || 0), 0);
    
    let routeStats = {};
    tickets.forEach(ticket => {
        if (ticket.route_id && ticket.status === 'active') {
            if (!routeStats[ticket.route_id]) {
                routeStats[ticket.route_id] = { count: 0, seats: 0 };
            }
            routeStats[ticket.route_id].count++;
            routeStats[ticket.route_id].seats += ticket.seats ? ticket.seats.length : 0;
        }
    });
    
    let popularRoutes = Object.entries(routeStats)
        .sort((a, b) => b[1].seats - a[1].seats)
        .slice(0, 5)
        .map(([routeId, stats]) => {
            let route = routes.find(r => r.id === Number(routeId));
            if (route) {
                return {
                    route: route.routes[0].destination + ' - ' + route.routes[route.routes.length - 1].destination,
                    date: route.date,
                    tickets: stats.count,
                    seats: stats.seats
                };
            }
            return null;
        })
        .filter(r => r !== null);
    
    let busStats = {};
    routes.forEach(route => {
        if (route.bus_id) {
            if (!busStats[route.bus_id]) {
                busStats[route.bus_id] = { routes: 0, tickets: 0 };
            }
            busStats[route.bus_id].routes++;
            let routeTickets = tickets.filter(t => t.route_id === route.id && t.status === 'active');
            busStats[route.bus_id].tickets += routeTickets.length;
        }
    });
    
    let busStatsList = Object.entries(busStats)
        .map(([busId, stats]) => {
            let bus = buses.find(b => b.id === Number(busId));
            if (bus) {
                return {
                    bus: bus.bus_number,
                    driver: bus.driver,
                    routes: stats.routes,
                    tickets: stats.tickets
                };
            }
            return null;
        })
        .filter(b => b !== null);
    
    page.innerHTML = `
        <div>
            <h3>Аналитика</h3>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 20px;">
                <div style="background: var(--gray_2-100); padding: 20px; border-radius: 4px; border: 1px solid var(--gray_2-70);">
                    <p class="inter_16_m" style="color: var(--primary-main); margin-bottom: 8px;">${totalSold}</p>
                    <p class="inter_14_m" style="color: var(--text-color);">Всего продано билетов</p>
                </div>
                <div style="background: var(--gray_2-100); padding: 20px; border-radius: 4px; border: 1px solid var(--gray_2-70);">
                    <p class="inter_16_m" style="color: var(--success-main); margin-bottom: 8px;">${activeTickets.length}</p>
                    <p class="inter_14_m" style="color: var(--text-color);">Активных билетов</p>
                </div>
                <div style="background: var(--gray_2-100); padding: 20px; border-radius: 4px; border: 1px solid var(--gray_2-70);">
                    <p class="inter_16_m" style="color: var(--danger-main); margin-bottom: 8px;">${returnedTickets.length}</p>
                    <p class="inter_14_m" style="color: var(--text-color);">Возвращено билетов</p>
                </div>
                <div style="background: var(--gray_2-100); padding: 20px; border-radius: 4px; border: 1px solid var(--gray_2-70);">
                    <p class="inter_16_m" style="color: var(--warning-main); margin-bottom: 8px;">${totalRevenue.toLocaleString()} ₽</p>
                    <p class="inter_14_m" style="color: var(--text-color);">Выручка</p>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px;">
                <div style="background: var(--gray_2-100); padding: 20px; border-radius: 4px; border: 1px solid var(--gray_2-70);">
                    <h3 style="margin-bottom: 15px;">Популярные маршруты</h3>
                    <table style="width: 100%;">
                        <thead>
                            <tr>
                                <th>Маршрут</th>
                                <th>Дата</th>
                                <th>Билетов</th>
                                <th>Мест</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${popularRoutes.length > 0 ? popularRoutes.map(r => `
                                <tr>
                                    <td>${r.route}</td>
                                    <td>${r.date}</td>
                                    <td>${r.tickets}</td>
                                    <td>${r.seats}</td>
                                </tr>
                            `).join('') : '<tr><td colspan="4" style="text-align: center;">Нет данных</td></tr>'}
                        </tbody>
                    </table>
                </div>
                
                <div style="background: var(--gray_2-100); padding: 20px; border-radius: 4px; border: 1px solid var(--gray_2-70);">
                    <h3 style="margin-bottom: 15px;">Статистика по автобусам</h3>
                    <table style="width: 100%;">
                        <thead>
                            <tr>
                                <th>Автобус</th>
                                <th>Водитель</th>
                                <th>Рейсов</th>
                                <th>Билетов</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${busStatsList.length > 0 ? busStatsList.map(b => `
                                <tr>
                                    <td>${b.bus}</td>
                                    <td>${b.driver}</td>
                                    <td>${b.routes}</td>
                                    <td>${b.tickets}</td>
                                </tr>
                            `).join('') : '<tr><td colspan="4" style="text-align: center;">Нет данных</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div style="background: var(--gray_2-100); padding: 20px; border-radius: 4px; border: 1px solid var(--gray_2-70); margin-top: 30px;">
                <h3 style="margin-bottom: 15px;">Общая статистика</h3>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                    <div>
                        <p class="inter_14_m" style="color: var(--text-color); margin-bottom: 5px;">Всего рейсов</p>
                        <p class="inter_16_m" style="color: var(--primary-main);">${routes.length}</p>
                    </div>
                    <div>
                        <p class="inter_14_m" style="color: var(--text-color); margin-bottom: 5px;">Всего автобусов</p>
                        <p class="inter_16_m" style="color: var(--primary-main);">${buses.length}</p>
                    </div>
                    <div>
                        <p class="inter_14_m" style="color: var(--text-color); margin-bottom: 5px;">Всего мест продано</p>
                        <p class="inter_16_m" style="color: var(--primary-main);">${totalSeatsSold}</p>
                    </div>
                </div>
            </div>
            
            <div style="background: var(--gray_2-100); padding: 20px; border-radius: 4px; border: 1px solid var(--gray_2-70); margin-top: 30px;">
                <h3 style="margin-bottom: 15px;">Билеты</h3>
                <table style="width: 100%;">
                    <thead>
                        <tr>
                            <th>№ билета</th>
                            <th>Маршрут</th>
                            <th>Цена</th>
                            <th>ФИО пассажира</th>
                            <th>Место</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${activeTickets.length > 0 ? activeTickets.map(ticket => {
                            let route = routes.find(r => r.id === ticket.route_id);
                            let routeInfo = '';
                            if (ticket.from_city && ticket.to_city) {
                                routeInfo = ticket.from_city + ' - ' + ticket.to_city;
                            } else if (route) {
                                routeInfo = route.routes[0].destination + ' - ' + route.routes[route.routes.length - 1].destination;
                            } else {
                                routeInfo = '-';
                            }
                            return `
                                <tr>
                                    <td>${ticket.id}</td>
                                    <td>${routeInfo}</td>
                                    <td>${ticket.price || 0} ₽</td>
                                    <td>${ticket.passenger_name || '-'}</td>
                                    <td>${ticket.seats ? ticket.seats.join(', ') : '-'}</td>
                                </tr>
                            `;
                        }).join('') : '<tr><td colspan="5" style="text-align: center;">Нет активных билетов</td></tr>'}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="text-align: right; font-weight: 600; padding-top: 15px; border-top: 1px solid var(--gray_2-70);">Итого:</td>
                            <td style="font-weight: 600; padding-top: 15px; border-top: 1px solid var(--gray_2-70);">${activeTickets.reduce((sum, t) => sum + (t.price || 0), 0)} ₽</td>
                            <td colspan="2" style="padding-top: 15px; border-top: 1px solid var(--gray_2-70);"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    `;
}

