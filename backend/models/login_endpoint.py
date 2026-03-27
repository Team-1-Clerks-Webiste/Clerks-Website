from fastapi import FastAPI as app

users = [
    {"id": 1,"username":"user 1", "password":"pass", "email":"example@example.com","created_at":"1/1/1"},
    {"id": 2,"username":"user 2", "password":"password_1234", "email":"example@other_example.com","created_at":"1/1/1"},
    {"id": 3,"username":"John Smith", "password":"realy_strong_password", "email":"you@example.com","created_at":"1/1/1"},
         ]

def get_db():
    conn = sqlite3.connect("clerksdb.db")
    conn.row_factory = sqlite3.row
    return conn

@app.get("/users")
def get_user():
    conn = get_db()
    users = conn.execute("Select username, password, email From users").fetchall()
    return [dict(user) for user in users]
    





