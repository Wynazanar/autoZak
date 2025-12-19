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