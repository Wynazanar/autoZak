function setHomePage() {
    let page = document.querySelector("section");
    
    page.innerHTML = `<h3>Главная</h3>`;
    page.innerHTML += getCards();
}

function getCards() {
    
    let cards = ``;
    
    let data = [
        localStorage.getItem("routes"),
        localStorage.getItem("bus"),
    ];
    let info = {
        "0": "Рейсы",
        "1": "Билеты"
    };
    console.log(data);

    try {
        for (let i = 0; i < data.length; i++) {
        const elem = data[i];
        
        if (elem !== null && elem.trim() !== "") {
            const parsedData = JSON.parse(elem);
        
            cards += `
                <div>
                    <p class="inter_16_m">${parsedData.length || 0}</p>
                    <p class="inter_14_m">${info[i.toString()]}</p>
                </div>`;
        }
    }
    } catch(error) {

    }

    return cards;
}