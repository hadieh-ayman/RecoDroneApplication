// ################### Connecting to ROS ###################

var rosbridge_url = "ws://localhost:9090";
var first_close = true;

var ros = new ROSLIB.Ros({
    url: rosbridge_url,
});

ros.on("connection", function () {
    console.log("Connected to websocket server.");
});

ros.on("error", function (error) {
    console.log("Error connecting to websocket server: ", error);
});

ros.on("close", function () {
    console.log("Connection to websocket server closed.");
});

// Handle ROS connection
window.setInterval(function () {
    if (ros.isConnected) return;
    console.log(ros.isConnected);
    ros.connect(rosbridge_url);
}, 1000);

// ################### Define image topics ###################

var rviz_stream = new ROSLIB.Topic({
    ros: ros,
    name: "/rviz1/camera1/image_compressed/compressed",
    messageType: "sensor_msgs/CompressedImage",
});

// ################### Subscribe to image topics ###################

function stream_start() {
    console.log("stream is starting");
    rviz_stream.subscribe(function (message) {
        console.log("stream is started successfully");
        document.getElementById("rviz-screen").src =
            "data:image/jpg;base64," + message.data;
        rviz_stream.unsubscribe();
    });
}
