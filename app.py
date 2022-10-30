# save this as app.py
from flask import Flask, request, render_template
from markupsafe import escape

app = Flask(__name__,template_folder='Presentation/templates', static_folder='Presentation/static')


@app.route('/')
@app.route('/login')
def login():
    return render_template('login.html', title='Login')

@app.route('/home')
def home():
    return render_template('home.html', title='Home')


if __name__ == "__main__":
    app.run(debug=True)