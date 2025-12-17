function changePage(page) {
    switch(page) {
        case "home": setHomePage(); break;
        case "tickets": setTcketsPage(); break;
        case "map": setRoutesPage(); break;
        default: setHomePage();
    }
}

changePage("tickets");