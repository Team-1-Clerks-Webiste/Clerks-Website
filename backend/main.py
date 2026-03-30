from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from schemas.user import init_users_table
from schemas.shoe import init_shoes_table
from schemas.orders import init_orders_table
from models.shoe_endpoint import router as shoes_router
from models.login_endpoint import router as auth_router
from models.cart_endpoint import router as cart_router
from models.orders_endpoint import router as orders_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# create tables on startup
init_users_table()
init_shoes_table()
init_orders_table()

# link routes
app.include_router(shoes_router)
app.include_router(auth_router)
app.include_router(cart_router)
app.include_router(orders_router)

@app.get("/")
def home():
    return {"message": "Welcome to Clerks API"}
