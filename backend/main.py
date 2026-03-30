from fastapi import FastAPI
<<<<<<< HEAD
from fastapi.middleware.cors import CORSMiddleware
from schemas.user import init_users_table
from schemas.shoe import init_shoes_table
from schemas.orders import init_orders_table
from models.shoe_endpoint import router as shoes_router
from models.login_endpoint import router as auth_router
from models.cart_endpoint import router as cart_router
from models.orders_endpoint import router as orders_router
=======
from backend.schemas.user import init_users_table
from backend.schemas.shoe import init_shoes_table
from backend.schemas.orders import init_orders_table
from backend.models.shoe_endpoint import router as shoes_router
from backend.models.login_endpoint import router as auth_router
from backend.models.cart_endpoint import router as cart_router
from backend.models.orders_endpoint import router as orders_router
>>>>>>> 65f16f54bb48cd837770de8f4c75cab1865788d3

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
