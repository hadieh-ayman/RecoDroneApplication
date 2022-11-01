const hamburger = document.querySelector('.hamburger');
const menu_link = document.querySelectorAll('.menu-item');
const logo = document.querySelector('.logo');
let newUrl = 'static/img/logo-animated.svg';
const logo_img = document.querySelector('.logo-image');

hamburger.addEventListener('click', function(){
    this.classList.toggle('active');
})

menu_link.forEach(input => input.addEventListener('click', this.classList.toggle("active")));

