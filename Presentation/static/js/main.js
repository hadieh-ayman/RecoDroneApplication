const hamburger = document.querySelector('.hamburger');
const menu_link = document.querySelectorAll('.menu-item');

hamburger.addEventListener('click', function(){
    this.classList.toggle('active');
})

menu_link.forEach(input => input.addEventListener('click', this.classList.toggle("active")));