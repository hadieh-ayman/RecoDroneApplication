let switchbox = document.querySelector(".switch-box");
let left_controller = document.getElementById("left-circle");
let right_controller = document.getElementById("right-circle");

window.onload = function () {
  createJoystick();
};

function leftClick() {
  switchbox.style.left = "0.2rem";
  switchbox.style.width = "5rem";
}

function rightClick() {
  switchbox.style.left = "5.6rem";
  switchbox.style.width = "5.4rem";
}
