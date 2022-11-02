const hamburger = document.querySelector('.hamburger');
const menu_link = document.querySelectorAll('.menu-item');
const navbar = document.querySelector('.header');
const form = document.querySelector(".login-form")
const username = document.getElementById('username')

window.onscroll = () => {
    if (window.scrollY > 50) {
        navbar.classList.add('show-bg');
    } else {
        navbar.classList.remove('show-bg');
    }
};

hamburger.addEventListener('click', function(){
    this.classList.toggle('active');
})

menu_link.forEach(input => input.addEventListener('click', this.classList.toggle("active")));

form.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('error!')
    if(username.value == ''){
        console.log('error!')
    }
})

