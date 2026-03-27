from fastapi import FastAPI
# from models.login_endpoint import router as auth_router


from schemas.user import init_users_table

app = FastAPI()


#create tables on startup
init_users_table()


#link the routes
 # app.include_router(auth_router)

@app.get("/")
def home():
    return {"message": "Welcome to Clerks API"}

