from flask import render_template, flash, redirect, url_for, request
from recodroneapplication import app, bcrypt
from recodroneapplication.forms import LoginForm
from recodroneapplication.models import User, Drone
from flask_login import login_user, current_user, logout_user, login_required


@app.route('/')
@app.route('/home')
def home():
    return render_template('home.html', title='RecoDrone')

@app.route('/login', methods={'GET', 'POST'})
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and bcrypt.check_password_hash(user.password, form.password.data):
            login_user(user, False)
            next_page = request.args.get('next')
            return redirect(next_page) if next_page else redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password!')
    return render_template('login.html', title='RecoDrone-Login', form=form)

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('home'))


@app.route('/dashboard')
@login_required
def dashboard():
    drone = Drone.query.filter_by(owner=current_user).first()
    return render_template('dashboard.html', title='RecoDrone-Dashboard', drone=drone)


