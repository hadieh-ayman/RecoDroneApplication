// ################### Pop Ups ###################

let popup = document.querySelector(".popup");
let close_popup = document.querySelector(".alert-close");
let alert_item = document.querySelector(".alert-item");
let popup_circle = document.querySelector(".alert-circle");
let popup_text = document.querySelector(".alert-text");
let goal_form = document.querySelector(".goal-form");
let goal_btn = document.querySelector(".goal-btn");

close_popup.addEventListener("click", function () {
  console.log("close popup");
  popup.classList.remove("active");
  goal_form.classList.add("hide");
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
    popup.classList.add("active");
    alert_item.classList.remove("hide")
    ros.connect(rosbridge_url);
  }
}, 1000);

// ################### Publish Goal topic ###################

goal_btn.addEventListener("click", function () {
  alert_item.classList.add("hide");
  goal_form.classList.remove("hide");
  popup.classList.add("active");
});

let actionClient = new ROSLIB.ActionClient({
  ros: ros,
  serverName: "/move_base",
  actionName: "move_base_msgs/MoveBaseAction",
});

let move_baseListener = new ROSLIB.Topic({
  ros: ros,
  name: "/move_base/result",
  messageType: "move_base_msgs/MoveBaseActionResult",
});

let goal = undefined;

function postGoal(form) {
  let x = form.x.value;
  let y = form.y.value;
  console.log(x + ", " + y);
  let positionVec3 = new ROSLIB.Vector3(null);
  let orientation = new ROSLIB.Quaternion({ x: 0.0, y: 0.0, z: 0.0, w: 1.0 });
  positionVec3.x = parseFloat(x);
  positionVec3.y = parseFloat(y);

  let pose = new ROSLIB.Pose({
    position: positionVec3,
    orientation: orientation,
  });

  goal = new ROSLIB.Goal({
    actionClient: actionClient,
    goalMessage: {
      target_pose: {
        header: {
          frame_id: "map",
        },
        pose: pose,
      },
    },
  });
  console.log("sending goal");
  goal.send();
  popup.classList.remove("active");
  goal_form.classList.add("hide");
  alert_item.classList.remove("hide");
}

function cancelGoal() {
  goal.cancel();
  popup.classList.remove("active");
  goal_form.classList.add("hide");
  alert_item.classList.remove("hide");
}

move_baseListener.subscribe(function (actionResult) {
  console.log(
    "Received message on " +
      move_baseListener.name +
      "status: " +
      actionResult.status.status
  );
  move_baseListener.unsubscribe();
});

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

    case "2D-2":
      console.log("Zoomed 2D map is broadcasting");
      rviz_stream = new ROSLIB.Topic({
        ros: ros,
        name: "/camera2/image_compressed/compressed",
        messageType: "sensor_msgs/CompressedImage",
      });
      stream_start();
      break;

      case "pc":
      console.log("3D map is broadcasting");
      rviz_stream = new ROSLIB.Topic({
        ros: ros,
        name: "/camera3/image_compressed/compressed",
        messageType: "sensor_msgs/CompressedImage",
      });
      stream_start();
      break;

      case "3D":
      console.log("2D image is broadcasting");
      rviz_stream = new ROSLIB.Topic({
        ros: ros,
        name: "/scan_image/image_compressed/compressed",
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
  popup_text.innerHTML = `Switching drone state to Manual.`;
  alert_item.classList.remove('hide')
  popup.classList.add("active");
  popup.classList.add("loading");
}

function rightClick() {
  switchbox.style.left = "5.6rem";
  switchbox.style.width = "5.4rem";
  drone_state = "offboard";
  popup_text.innerHTML = `Switching drone state to Offboard.`;
  alert_item.classList.remove('hide')
  popup.classList.add("active");
  popup.classList.add("loading");
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
  let timer;

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
    let max_angular = 1.0; // rad/s
    let max_distance = 40.0; // pixels;
    angular_speed =
      (-Math.cos(nipple.angle.radian) * max_angular * nipple.distance) /
      max_distance;
  });

  joystickR.on("move", function (event, nipple) {
    let max_linear = 1.0; // m/s
    let max_distance = 40.0; // pixels;
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
let sec = 0;
let counting = undefined;
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
        alert_item.classList.remove('hide')
        popup.classList.add("active");
        popup.classList.add("loading");
        popup_text.innerHTML = `Drone is taking off one meter above ground.`;
        start_timer();
      }
    }
  );
  setTimeout(finish, 30000);
});

land.addEventListener("click", function () {
  land_service.callService(new ROSLIB.ServiceRequest({}), function (result) {
    if (result.success) {
      alert_item.classList.remove('hide')
      popup.classList.add("active");
      popup.classList.add("loading");
      popup_text.innerHTML = `Drone is landing.`;
      end_timer();
    }
  });
  setTimeout(finish, 30000);
});

let start_timer = function () {
  function pad(val) {
    return val > 9 ? val : "0" + val;
  }
  counting = setInterval(function () {
    document.getElementById("seconds").innerHTML = pad(++sec % 60);
    document.getElementById("minutes").innerHTML = pad(parseInt(sec / 60, 10));
    document.getElementById("hours").innerHTML = pad(parseInt(sec / 360, 10));
  }, 1000);
};

let end_timer = function () {
  document.getElementById("seconds").innerHTML = `00`;
  document.getElementById("minutes").innerHTML = `00`;
  document.getElementById("hours").innerHTML = `00`;
  sec = 0;
  clearInterval(counting);
};

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
window.setInterval(function () {
  getTelemetry.callService(
    new ROSLIB.ServiceRequest({ frame_id: "map" }),
    function (result) {
      // Service respond callback
      let telemetry_json = JSON.stringify(result);
      telemetry = JSON.parse(telemetry_json);

      if (telemetry.connected) {
        fcu.innerHTML = "CONNECTED";
        fcu.classList.add("success");
      } else {
        fcu.innerHTML = "DISCONNECTED";
        fcu.classList.remove("success");
      }
      if (telemetry.armed) {
        arm.innerHTML = "ARMED";
        arm.classList.add("success");
      } else {
        arm.innerHTML = "DISARMED";
        arm.classList.remove("success");
      }
      battery.innerHTML =
        ((telemetry.cell_voltage / telemetry.voltage) * 100).toFixed(0) + "%";
      coord_x.innerHTML = telemetry.x.toFixed(3) + " M";
      coord_y.innerHTML = telemetry.y.toFixed(3) + " M";
      coord_z.innerHTML = telemetry.z.toFixed(3) + " M";

      velocity = Math.sqrt(
        Math.pow(telemetry.vx, 2) + Math.pow(telemetry.vy, 2)
      );
      vel.innerHTML = velocity.toFixed(1);
      let degree = Math.floor((velocity / 1.5) * 180);
      needle.style.transform = "rotate(" + degree + "deg)";
    }
  );
}, 1000);
