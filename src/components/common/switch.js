function Switch(checked) {
    return (`
        <div class="toggle-switch ${checked}" onclick="changeSwitch(this)">
            <span class="switch"></span>
        </div>    
    `);
}

function changeSwitch(event) {
    event.classList.toggle("true");
    console.log(event.classList[1]);
}