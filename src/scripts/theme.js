let body = document.querySelector("body");
setTheme();

function changeTheme() {
    if (localStorage.getItem("theme") == "dark") {
        body.classList.remove("dark");
        localStorage.setItem("theme", "light");
    } else {
        body.classList.add("dark");
        localStorage.setItem("theme", "dark");
    }
}

function setTheme() {
    if (localStorage.getItem("theme") == "dark") {
        body.classList.add("dark");
    } else {
        body.classList.remove("dark");
    }
}