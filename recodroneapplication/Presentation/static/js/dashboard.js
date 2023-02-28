//dropdown menu
const dropdown = document.querySelector(".dropdown-menu");
const select = dropdown.querySelector(".menu-select");
const arrow = dropdown.querySelector(".menu-arrow");
const menu = dropdown.querySelector(".view-menu");
const options = dropdown.querySelectorAll(".view-link");
let switchbox = document.querySelector(".switch-box");
let left_controller = document.getElementById("left-circle");
let right_controller = document.getElementById("right-circle");

select.addEventListener("click", () => {
  arrow.classList.toggle("rotate");
  menu.classList.toggle("active");
});

document.addEventListener("keydown", function (e) {
  if (e.defaultPrevented) {
    return; // Do nothing if the event was already processed
  }
  switch (e.key) {
    case "s":
        left_controller.style.top = "75%";
        break;
    case "l":
        right_controller.style.top = "75%";
      break;
    case "w":
        left_controller.style.top = "25%";
        break;
    case "o":
        right_controller.style.top = "25%";
      break;
    case "a":
        left_controller.style.left = "25%";
        break;
    case "k":
        right_controller.style.left = "25%";
        break;
    case "d":
        left_controller.style.left = "75%";
        break;
    case ";":
        right_controller.style.left = "75%";
        break;
    default:
        return;
  }
});

document.addEventListener("keyup", function (e) {
    if (e.defaultPrevented) {
      return; // Do nothing if the event was already processed
    }
    switch (e.key) {
      case "s":
          left_controller.style.top = "50%";
          break;
      case "l":
          right_controller.style.top = "50%";
        break;
      case "w":
          left_controller.style.top = "50%";
          break;
      case "o":
          right_controller.style.top = "50%";
        break;
      case "a":
          left_controller.style.left = "50%";
          break;
      case "k":
          right_controller.style.left = "50%";
          break;
      case "d":
          left_controller.style.left = "50%";
          break;
      case ";":
          right_controller.style.left = "50%";
          break;
      default:
          return;
    }
  });

function leftClick() {
  switchbox.style.left = "0.2rem";
  switchbox.style.width = "5rem";
}

function rightClick() {
  switchbox.style.left = "5.6rem";
  switchbox.style.width = "5.4rem";
}
