from flask import render_template, flash, redirect, url_for
from recodroneapplication.forms import LoginForm
from recodroneapplication import app

@app.route('/')
@app.route('/home')
def home():
    return render_template('home.html', title='RecoDrone')

@app.route('/login', methods={'GET', 'POST'})
def login():
    form = LoginForm()
    if form.validate_on_submit():
        if form.email.data == 'admin@example.com' and form.password.data == '123456':
            flash('You have successfully logged in!')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password!')
    return render_template('login.html', title='RecoDrone-Login', form=form)


@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html', title='RecoDrone-Dashboard')

