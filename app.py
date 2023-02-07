# save this as app.py
from flask import Flask, request, render_template
from forms import LoginForm
from markupsafe import escape

app = Flask(__name__,template_folder='Presentation/templates', static_folder='Presentation/static')

app.config['SECRET_KEY'] = '5791628bb0b13ce0c676dfde280ba245'


@app.route('/home')
def home():
    return render_template('home.html', title='RecoDrone')

@app.route('/login')
def login():
    form = LoginForm()
    return render_template('login.html', title='RecoDrone-Login', form=form)

@app.route('/')
@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html', title='RecoDrone-Dashboard')


if __name__ == "__main__":
    app.run(debug=True)