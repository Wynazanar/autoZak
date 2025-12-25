function createNewAudit(type, action, entity, status) {
    let audit = JSON.parse(localStorage.getItem("audit")) || [];

    let newAudit = {
        id: audit.length + 1,
        user: localStorage.getItem("this_user") || 0,
        type: type,
        action: action,
        entity: entity,
        status: status,
        date: new Date()
    }

    audit.push(newAudit);
    localStorage.setItem("audit", JSON.stringify(audit));
}

function createNewTicket(id, route_id, ticket) {
    let tickets = JSON.parse(localStorage.getItem("tickets")) || [];
    let tickets_data = tickets.tickets;

    let newTT = {
        sit: ticket.sit,
        info: ticket.info
    };

    tickets_data.push(newTT);

    let newTicket = {
        id: id || Math.floor(Math.random() * 999999) + 1,
        route_id: route_id,
        tickets: tickets_data,
    };

    tickets.push(newTicket);
    localStorage.setItem("tickets", JSON.stringify(tickets));
}