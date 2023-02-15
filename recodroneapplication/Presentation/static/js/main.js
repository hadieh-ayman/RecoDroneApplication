const hamburger = document.querySelector(".hamburger");
const menu_link = document.querySelectorAll(".menu-item");
const navbar = document.querySelector(".header");
const login_form = document.querySelector(".login-form");
const username = document.getElementById("username");
const password = document.getElementById("password");
const error_message = document.querySelectorAll(".error-span");
const error_border = document.querySelectorAll(".input-border");


window.onscroll = () => {
    if (window.scrollY > 50) {
        navbar.classList.add("show-bg");
    } else {
        navbar.classList.remove("show-bg");
    }
};

//home / login

hamburger.addEventListener("click", function () {
    this.classList.toggle("active");
});

menu_link.forEach((input) =>
    input.addEventListener("click", () => { input.classList.toggle("active")})
);

// login_form.addEventListener("submit", (e) => {
//     let error = 0;
//     if ((username.value === "" || username.value !== "admin") && (password.value === "" || password.value !== "pass123")) {
//         error++;
//     }

//     if (error > 0) {
//         e.preventDefault();
//         error_message.forEach((error) => {error.classList.add('show')})
//         error_border.forEach((error) => {error.classList.add('error')})
//     }
// });

