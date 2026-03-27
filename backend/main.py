from fastapi import FastAPI
from schemas.user import init_users_table
from schemas.shoe import init_shoes_table
from models.shoe_endpoint import router as shoes_router

app = FastAPI()

# create tables on startup
init_users_table()
init_shoes_table()

# link routes
app.include_router(shoes_router)

@app.get("/")
def home():
    return {"message": "Welcome to Clerks API"}