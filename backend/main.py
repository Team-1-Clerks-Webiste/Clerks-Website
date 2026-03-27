from fastapi import FastAPI

from schemas.user import init_users_table

app = FastAPI()


init_users_table()