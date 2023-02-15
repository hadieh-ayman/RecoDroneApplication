//dropdown menu
const dropdown = document.querySelector(".dropdown-menu");
const select = dropdown.querySelector(".menu-select");
const arrow = dropdown.querySelector(".menu-arrow");
const menu = dropdown.querySelector(".view-menu");
const options = dropdown.querySelectorAll(".view-link");
let switchbox = document.querySelector(".switch-box");

select.addEventListener("click", () => {
    arrow.classList.toggle("rotate");
    menu.classList.toggle("active")
})

function leftClick(){
    switchbox.style.left = "0.2rem";
    switchbox.style.width = "5rem"
}

function rightClick(){
    switchbox.style.left = "5.6rem";
    switchbox.style.width = "5.4rem"
}
