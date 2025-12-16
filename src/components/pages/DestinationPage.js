function setRoutesPage() {
    let page = document.querySelector("section");
    page.innerHTML = `
        <h3>Рейсы</h3>
        ${getTable()}
    `;
}

function getTable() {
    return(`
        <table>
            <thead>
                <tr>
                    <th>Header text</th>
                    <th>Header text</th>
                    <th>Header text</th>
                    <th>Header text</th>
                </tr>  
            </thead>
            <tbody>
                <tr>
                    <td>Текккст</td>
                    <td>Текккст</td>
                    <td>Текккст</td>
                    <td>Текккст</td>
                </tr>
                <tr>
                    <td>Текккст</td>
                    <td>Текккст</td>
                    <td>Текккст</td>
                    <td>Текккст</td>
                </tr>
                <tr>
                    <td>Текккст</td>
                    <td>Текккст</td>
                    <td>Текккст</td>
                    <td>Текккст</td>
                </tr>
                <tr>
                    <td>Текккст</td>
                    <td>Текккст</td>
                    <td>Текккст</td>
                    <td>Текккст</td>
                </tr>
            </tbody>
        <table>    
    `);
}