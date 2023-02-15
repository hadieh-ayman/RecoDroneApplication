from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, BooleanField
from wtforms.validators import DataRequired, Email

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired("Email is required"), Email()], render_kw={"placeholder": "Please enter your email"})
    password = PasswordField('Password', validators=[DataRequired("Password is required")], render_kw={"placeholder": "Please enter your password"})
    remember = BooleanField('Remember Me')
    submit = SubmitField('Login')