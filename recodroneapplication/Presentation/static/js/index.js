// ################### Connecting to ROS ###################

var rosbridge_url = "ws://localhost:9090";
var first_close = true;

var ros = new ROSLIB.Ros({
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

var rviz_stream = new ROSLIB.Topic({
    ros: ros, name: '/rviz1/camera1/image_compressed/compressed',
    messageType: 'sensor_msgs/CompressedImage'
  });

// ################### Subscribe to image topics ###################

var stream = undefined;

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

var telemetry
var fcu = document.getElementById('fcu')
var arm = document.getElementById('arm')
var battery = document.getElementById('battery')
var coord_x = document.getElementById('x')
var coord_y = document.getElementById('y')
var coord_z = document.getElementById('z')

// Declare get_telemetry service client
var getTelemetry = new ROSLIB.Service({ 
    ros: ros, 
    name : '/get_telemetry', 
    serviceType : 'clover/GetTelemetry'
});

// Call get_telemetry
getTelemetry.callService(
    new ROSLIB.ServiceRequest({ frame_id: 'map' }), function(result) {
    // Service respond callback
    telemetry_json = JSON.stringify(result)
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
    battery.innerHTML = ((telemetry.cell_voltage/telemetry.voltage) * 100).toFixed(2) + "%";
    coord_x.innerHTML = (telemetry.x).toFixed(3);
    coord_y.innerHTML = (telemetry.y).toFixed(3);
    coord_z.innerHTML = (telemetry.z).toFixed(3);
});
