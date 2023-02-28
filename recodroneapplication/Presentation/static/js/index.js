// ################### Connecting to ROS ###################

let rosbridge_url = "ws://localhost:9090";
let first_close = true;

let ros = new ROSLIB.Ros({
    url: rosbridge_url,
});

ros.on("connection", function () {
    console.log("Connected to websocket server.");
    stream_start();
});

ros.on("error", function (error) {
    console.log("Error connecting to websocket server: ", error);
});

ros.on("close", function () {
    console.log("Connection to websocket server closed.");
});

// Handle ROS connection
window.setInterval(function () {
    if (ros.isConnected)
        console.log(ros.isConnected);
        return;
    console.log(ros.isConnected);
    ros.connect(rosbridge_url);
}, 1000);

// ################### Define image topics ###################

let rviz_stream = new ROSLIB.Topic({
    ros: ros, name: '/rviz1/camera1/image_compressed/compressed',
    messageType: 'sensor_msgs/CompressedImage'
  });

// ################### Subscribe to image topics ###################

let stream = undefined;

function stream_start() {
    console.log('stream is starting');
    if (stream != undefined) {stream.unsubscribe();}
    stream = rviz_stream;
    console.log("about to subscribe")
    rviz_stream.subscribe(function(message) {
      console.log("subscribed")
      document.getElementById('rviz-screen').src = "data:image/jpg;base64," + message.data;
    });
  }

// ################### Call telemetry service ###################

let telemetry
let fcu = document.getElementById('fcu')
let arm = document.getElementById('arm')
let battery = document.getElementById('battery')
let coord_x = document.getElementById('x')
let coord_y = document.getElementById('y')
let coord_z = document.getElementById('z')
let vel = document.querySelector('.velocity')
let needle = document.querySelector('.needle')
let velocity


// Declare get_telemetry service client
let getTelemetry = new ROSLIB.Service({ 
    ros: ros, 
    name : '/get_telemetry', 
    serviceType : 'clover/GetTelemetry'
});

// Call get_telemetry
getTelemetry.callService(
    new ROSLIB.ServiceRequest({ frame_id: 'map' }), function(result) {
    // Service respond callback
    let telemetry_json = JSON.stringify(result)
    console.log('Telemetry: ' + telemetry_json);
    telemetry = JSON.parse(telemetry_json);
    
    if(telemetry.connected){
        fcu.innerHTML = "CONNECTED";
    } else {
        fcu.innerHTML = "DISCONNECTED";
    }
    if(telemetry.armed){
        arm.innerHTML = "ARMED";
    } else {
        arm.innerHTML = "DISARMED";
    }
    battery.innerHTML = ((telemetry.cell_voltage/telemetry.voltage) * 100).toFixed(0) + "%";
    coord_x.innerHTML = (telemetry.x).toFixed(3) + " M";
    coord_y.innerHTML = (telemetry.y).toFixed(3) + " M";
    coord_z.innerHTML = (telemetry.z).toFixed(3) + " M";

    velocity = Math.sqrt(Math.pow(telemetry.vx, 2) + Math.pow(telemetry.vy, 2))
    vel.innerHTML = velocity.toFixed(1)
    let degree = Math.floor((velocity / 10) * 180)
    needle.style.transform = "rotate(" + degree + "deg)";
});

// ################### Navigation Commands ###################

let finish = true;

// Declare navigate service client
let navigate = new ROSLIB.Service({ 
    ros: ros, 
    name : '/navigate', 
    serviceType : 'clover/Navigate'
});

document.addEventListener("keydown", function (e) {
    if (e.defaultPrevented || finish==false) {
      return; // Do nothing if the event was already processed
    }
    switch (e.key) {
      case "l":
        navigate.callService(
            new ROSLIB.ServiceRequest({ x: 0, y:-0.5, z:0, frame_id:'body', auto_arm:True}), function(result){
                if(result.success){
                    finish = false;
                    alert("Drone is moving 0.5 meters backwards.")
                }
            });
        setTimeout(finish=true, 30000);
        break;
      case "o":
        navigate.callService(
            new ROSLIB.ServiceRequest({ x: 0, y:0.5, z:0, frame_id:'body', auto_arm:True}), function(result){
                if(result.success){
                    finish = false
                    alert("Drone is moving 0.5 meters forward.")
                }
            });
        setTimeout(finish=true, 30000)
        break;
      case "k":
        navigate.callService(
            new ROSLIB.ServiceRequest({ x:-0.5, y:0, z:0, frame_id:'body', auto_arm:True}), function(result){
                if(result.success){
                    finish = false
                    alert("Drone is moving 0.5 meters to the left.")
                }
            });
        setTimeout(finish=true, 30000)
          break;
      case ";":
        navigate.callService(
            new ROSLIB.ServiceRequest({ x:0.5, y:0, z:0, frame_id:'body', auto_arm:True}), function(result){
                if(result.success){
                    finish = false
                    alert("Drone is moving 0.5 meters to the right.")
                }
            });
        setTimeout(finish=true, 30000)
        break;
      default:
          return;
    }
    
  });

document.addEventListener("keyup", function (e) {
    case "s":
        navigate.callService(
            new ROSLIB.ServiceRequest({ speed:velocity-0.2, frame_id:'body', auto_arm:True}), function(result){
                if(result.success){
                    finish = false
                    alert("Drone is moving 0.2 m/s slower.")
                }
            });
        setTimeout(finish=true, 30000)
        break;
      case "w":
            navigate.callService(
                new ROSLIB.ServiceRequest({ speed:velocity+0.2, frame_id:'body', auto_arm:True}), function(result){
                    if(result.success){
                        finish = false
                        alert("Drone is moving 0.2 m/s faster.")
                    }
                });
            setTimeout(finish=true, 30000)
            break;
      case "a":
            navigate.callService(
                new ROSLIB.ServiceRequest({ yaw:degToRad(-45), frame_id:'body', auto_arm:True}), function(result){
                    if(result.success){
                        finish = false
                        alert("Drone is rotating 45 degrees clockwise.")
                    }
                });
            setTimeout(finish=true, 30000)
            break;
      case "d":
            navigate.callService(
                new ROSLIB.ServiceRequest({ yaw:degToRad(45), frame_id:'body', auto_arm:True}), function(result){
                    if(result.success){
                        finish = false
                        alert("Drone is rotating 45 degrees anticlockwise.")
                    }
                });
            setTimeout(finish=true, 30000)
            break; 
});

  function degToRad(deg) {
    return deg * (Math.PI / 180.0);
}

// ################### Land and Takeoff ###################

let loiter = document.querySelector('.loiter')
let land = document.querySelector('.land')

// Declare land service client
let land = new ROSLIB.Service({ 
    ros: ros, 
    name : '/land', 
    serviceType : 'std_srvs/Trigger'
});

loiter.addEventListener('click', function () {
    navigate.callService(
        new ROSLIB.ServiceRequest({ x:0, y:0, z:1, frame_id:'body', auto_arm:True}), function(result){
            if(result.success){
                alert("Drone is taking off one meter above ground.")
            }
        });
    setTimeout(finish=true, 30000)
}

land.addEventListener('click', function () {
    land.callService(
        new ROSLIB.ServiceRequest({}), function(result){
            if(result.success){
                alert("Drone is landing.")
            }
        });
    setTimeout(finish=true, 30000)
}

