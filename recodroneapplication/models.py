from recodroneapplication import db, login_manager
from datetime import datetime
from flask_login import UserMixin

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    image_file = db.Column(db.String(20), nullable=False, default='profile.jpg')
    password = db.Column(db.String(60), nullable=False)
    drones = db.relationship('Drone', backref='owner', lazy=True)

    def __repr__(self):
        return '<User %r %r %r>' % (self.username, self.email, self.image_file)

class Drone(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), nullable=False)
    version = db.Column(db.String(20), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    # stats = db.relationship('Telemetry', backref='drone', lazy=True)
    # commands = db.relationship('Navigate', backref='drone', lazy=True)


    def __repr__(self):
        return '<Drone %r %r>' % (self.name, self.version)

# class Telemetry(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     date_received = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
#     frame_id = db.Column(db.String(20), nullable=False)
#     connected = db.Column(db.Boolean, nullable=False, default=False)
#     armed = db.Column(db.Boolean, nullable=False, default=False)
#     mode = db.Column(db.String(20), nullable=False)
#     x = db.Column(db.Float, nullable=False)
#     y = db.Column(db.Float, nullable=False)
#     z = db.Column(db.Float, nullable=False)
#     lat = db.Column(db.Float, nullable=False)
#     lon = db.Column(db.Float, nullable=False)
#     alt = db.Column(db.Float, nullable=False)
#     vx = db.Column(db.Float, nullable=False)
#     vy = db.Column(db.Float, nullable=False)
#     vz = db.Column(db.Float, nullable=False)
#     pitch = db.Column(db.Float, nullable=False)
#     roll = db.Column(db.Float, nullable=False)
#     yaw = db.Column(db.Float, nullable=False)
#     pitch_rate = db.Column(db.Float, nullable=False)
#     roll_rate = db.Column(db.Float, nullable=False)
#     yaw_rate = db.Column(db.Float, nullable=False)
#     voltage = db.Column(db.Float, nullable=False)
#     cell_voltage = db.Column(db.Float, nullable=False)
#     drone_id = db.Column(db.Integer, db.ForeignKey('drone.id'), nullable=False)

#     def __repr__(self):
#         return '<Telemetry %r %r %r %r %r>' %(self.frame_id, self.date_received, self.x, self.y, self.z)

# class Navigate(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     date_sent = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
#     frame_id = db.Column(db.String(20), nullable=False)
#     x = db.Column(db.Float, nullable=False)
#     y = db.Column(db.Float, nullable=False)
#     z = db.Column(db.Float, nullable=False)
#     yaw = db.Column(db.Float, nullable=False)
#     yaw_rate = db.Column(db.Float, nullable=False)
#     speed = db.Column(db.Float, nullable=False)
#     auto_arm = db.Column(db.Boolean, nullable=False)
#     drone_id = db.Column(db.Integer, db.ForeignKey('drone.id'), nullable=False)

#     def __repr__(self):
#         return '<Navigate %r %r %r %r %r>' %(self.frame_id, self.date_sent, self.x, self.y, self.z)
     