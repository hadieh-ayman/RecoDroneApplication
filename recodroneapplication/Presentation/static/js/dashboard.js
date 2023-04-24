// ################### Pop Ups ###################

let popup = document.querySelector(".popup");
let close_popup = document.querySelector(".alert-close");
let popup_circle = document.querySelector(".alert-circle");
let popup_text = document.querySelector(".alert-text");

close_popup.addEventListener("click", function () {
  console.log("close popup");
  popup.classList.remove("active");
});

// ################### Connecting to ROS ###################

let rosbridge_url = "ws://localhost:9090";
let first_close = true;

let ros = new ROSLIB.Ros({
  url: rosbridge_url,
});

ros.on("connection", function () {
  console.log("Connected to websocket server.");
  popup_circle.classList.add("success");
  popup_text.innerHTML = `Connection to ROS is successful.`;
  stream_start();
});

ros.on("error", function (error) {
  console.log("Error connecting to websocket server: ", error);
  popup_circle.classList.remove("success");
  popup_text.innerHTML = `Connection to ROS failed.`;
});

ros.on("close", function () {
  console.log("Connection to websocket server closed.");
  popup_text.innerHTML = `Connection to ROS is closed.`;
});

//Handle ROS connection
window.setInterval(function () {
  if (ros.isConnected) {
    console.log(ros.isConnected);
  } else {
    console.log(ros.isConnected);
    // popup.classList.add('active')
    ros.connect(rosbridge_url);
  }
}, 1000);

// ################### Define image topics ###################

let view_menu = document.querySelector(".menu-select");
let rviz_stream = undefined;

view_menu.addEventListener("click", function () {
  console.log(view_menu.value);
  switch (view_menu.value) {
    case "camera":
      console.log("camera is broadcasting");
      rviz_stream = new ROSLIB.Topic({
        ros: ros,
        name: "/main_camera/image_raw/compressed",
        messageType: "sensor_msgs/CompressedImage",
      });
      stream_start();
      break;
    case "2D":
      console.log("2D map is broadcasting");
      rviz_stream = new ROSLIB.Topic({
        ros: ros,
        name: "/camera1/image_compressed/compressed",
        messageType: "sensor_msgs/CompressedImage",
      });
      stream_start();
      break;
    case "3D":
      console.log("3D map is broadcasting");
      rviz_stream = new ROSLIB.Topic({
        ros: ros,
        name: "/camera2/image_compressed/compressed",
        messageType: "sensor_msgs/CompressedImage",
      });
      stream_start();
      break;
  }
});

// ################### Subscribe to image topics ###################

let stream = undefined;

function stream_start() {
  console.log("stream is starting");
  if (stream != undefined) {
    stream.unsubscribe();
  }
  stream = rviz_stream;
  console.log("about to subscribe");
  rviz_stream.subscribe(function (message) {
    console.log("subscribed");
    document.getElementById("rviz-screen").src =
      "data:image/jpg;base64," + message.data;
  });
}

// ################### Manual/Auto Switch ###################

let switchbox = document.querySelector(".switch-box");
let drone_state = "offboard";

function leftClick() {
  switchbox.style.left = "0.2rem";
  switchbox.style.width = "5rem";
  drone_state = "manual";
  popup.classList.add("active");
  popup.classList.add("loading");
  popup_text.innerHTML = `Switching drone state to Manual.`;
}

function rightClick() {
  switchbox.style.left = "5.6rem";
  switchbox.style.width = "5.4rem";
  drone_state = "offboard";
  popup.classList.add("active");
  popup.classList.add("loading");
  popup_text.innerHTML = `Switching drone state to Offboard.`;
}

// ################### Navigation Commands ###################

let cmd_vel_listener = new ROSLIB.Topic({
  ros: ros,
  name: "/cmd_vel",
  messageType: "geometry_msgs/Twist",
});

let move = function (linear_x, linear_y, angular) {
  let twist = new ROSLIB.Message({
    linear: {
      x: linear_x,
      y: linear_y,
      z: 0,
    },
    angular: {
      x: 0,
      y: 0,
      z: angular,
    },
  });
  if (drone_state == "manual") cmd_vel_listener.publish(twist);
  else {
    popup.classList.add("active");
    popup.classList.remove("loading");
    popup_text.innerHTML = `Drone is currently in offboard <br> mode. Switch mode to Manual mode.`;
  }
};

let createJoystick = function () {
  let joystickL = nipplejs.create({
    zone: document.getElementById("left_joystick"),
    mode: "static",
    position: { left: "50%" },
    color: "white",
    threshold: 0.1,
    size: 80,
    restOpacity: 1,
    lockX: true,
  });

  let joystickR = nipplejs.create({
    zone: document.getElementById("right_joystick"),
    mode: "static",
    position: { left: "50%" },
    color: "white",
    threshold: 0.1,
    size: 80,
    restOpacity: 1,
  });

  let linear_speed_x = 0;
  let linear_speed_y = 0;
  let angular_speed = 0;
  var timer;

  joystickL.on("start", function (event, nipple) {
    timer = setInterval(function () {
      move(0, 0, angular_speed);
    }, 25);
  });

  joystickR.on("start", function (event, nipple) {
    timer = setInterval(function () {
      move(linear_speed_x, linear_speed_y, 0);
    }, 25);
  });

  joystickL.on("move", function (event, nipple) {
    max_angular = 2.0; // rad/s
    max_distance = 40.0; // pixels;
    angular_speed =
      (-Math.cos(nipple.angle.radian) * max_angular * nipple.distance) /
      max_distance;
  });

  joystickR.on("move", function (event, nipple) {
    max_linear = 2.0; // m/s
    max_distance = 40.0; // pixels;
    linear_speed_x =
      (Math.sin(nipple.angle.radian) * max_linear * nipple.distance) /
      max_distance;
    linear_speed_y =
      (-Math.cos(nipple.angle.radian) * max_linear * nipple.distance) /
      max_distance;
  });

  joystickL.on("end", function () {
    if (timer) {
      clearInterval(timer);
    }
    move(0, 0, 0);
  });

  joystickR.on("end", function () {
    if (timer) {
      clearInterval(timer);
    }
    move(0, 0, 0);
  });
};

window.onload = function () {
  createJoystick();
};

// ################### Land and Takeoff ###################

let finish = true;
let takeoff = document.querySelector(".takeoff");
let land = document.querySelector(".land");

// Declare navigate service client
let navigate = new ROSLIB.Service({
  ros: ros,
  name: "/navigate",
  serviceType: "clover/Navigate",
});

// Declare land service client
let land_service = new ROSLIB.Service({
  ros: ros,
  name: "/land",
  serviceType: "std_srvs/Trigger",
});

takeoff.addEventListener("click", function () {
  navigate.callService(
    new ROSLIB.ServiceRequest({
      x: 0,
      y: 0,
      z: 1,
      frame_id: "body",
      auto_arm: true,
    }),
    function (result) {
      if (result.success) {
        popup.classList.add("active");
        popup.classList.add("loading");
        popup_text.innerHTML = `Drone is taking off one meter above ground.`;
        console.log("Drone is taking off one meter above ground.");
      }
    }
  );
  setTimeout(finish, 30000);
});

land.addEventListener("click", function () {
  land_service.callService(new ROSLIB.ServiceRequest({}), function (result) {
    if (result.success) {
      popup.classList.add("active");
      popup.classList.add("loading");
      popup_text.innerHTML = `Drone is landing.`;
    }
  });
  setTimeout(finish, 30000);
});

// ################### Call telemetry service ###################

let telemetry;
let fcu = document.getElementById("fcu");
let arm = document.getElementById("arm");
let battery = document.getElementById("battery");
let coord_x = document.getElementById("x");
let coord_y = document.getElementById("y");
let coord_z = document.getElementById("z");
let vel = document.querySelector(".velocity");
let needle = document.querySelector(".needle");
let velocity;

// Declare get_telemetry service client
let getTelemetry = new ROSLIB.Service({
  ros: ros,
  name: "/get_telemetry",
  serviceType: "clover/GetTelemetry",
});

// Call get_telemetry
getTelemetry.callService(
  new ROSLIB.ServiceRequest({ frame_id: "map" }),
  function (result) {
    // Service respond callback
    let telemetry_json = JSON.stringify(result);
    console.log("Telemetry: " + telemetry_json);
    telemetry = JSON.parse(telemetry_json);

    if (telemetry.connected) {
      fcu.innerHTML = "CONNECTED";
    } else {
      fcu.innerHTML = "DISCONNECTED";
    }
    if (telemetry.armed) {
      arm.innerHTML = "ARMED";
    } else {
      arm.innerHTML = "DISARMED";
    }
    battery.innerHTML =
      ((telemetry.cell_voltage / telemetry.voltage) * 100).toFixed(0) + "%";
    coord_x.innerHTML = telemetry.x.toFixed(3) + " M";
    coord_y.innerHTML = telemetry.y.toFixed(3) + " M";
    coord_z.innerHTML = telemetry.z.toFixed(3) + " M";

    velocity = Math.sqrt(Math.pow(telemetry.vx, 2) + Math.pow(telemetry.vy, 2));
    vel.innerHTML = velocity.toFixed(1);
    let degree = Math.floor((velocity / 10) * 180);
    needle.style.transform = "rotate(" + degree + "deg)";
  }
);
