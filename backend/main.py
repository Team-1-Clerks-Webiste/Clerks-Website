from fastapi import FastAPI
from models.login_endpoint import router as auth_router


from schemas.user import init_users_table

app = FastAPI()


init_users_table()

@app.get("/")
def home():
    return {"message": "Welcome to Clerks API"}