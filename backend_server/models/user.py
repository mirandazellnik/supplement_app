from passlib.hash import bcrypt
from sqlalchemy.types import JSON

from backend_server.utils.extensions import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    name = db.Column(db.String(80), nullable=True)
    password_hash = db.Column(db.String(128), nullable=False)
    setup_complete = db.Column(db.Boolean, default=False)
    goals = db.Column(JSON, default=[])
    meds = db.Column(JSON, default=[])

    def set_password(self, password):
        self.password_hash = bcrypt.hash(password)

    def check_password(self, password):
        return bcrypt.verify(password, self.password_hash)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "name": self.name,
            "setup_complete": self.setup_complete,
            "goals": self.goals,
            "meds": self.meds
        }
