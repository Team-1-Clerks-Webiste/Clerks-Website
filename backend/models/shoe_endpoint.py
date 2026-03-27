from fastapi import FastAPI, APIRouter

app = FastAPI()
router = APIRouter()

shoes = [
    {"id": 1, "name": "Nike Air Max", "price": 120, "group": "men", "style": "running"},
    {"id": 2, "name": "Adidas Ultraboost", "price": 180, "group": "men", "style": "running"},
    {"id": 3, "name": "Puma Superstar", "price": 90, "group": "women", "style": "casual"},
]

@router.get("/shoes")
def get_shoes():
    return [{"name": shoe["name"], "price": shoe["price"], "group": shoe["group"], "style": shoe["style"]}
    for shoe in shoes]

app.include_router(router)