from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.mount("/node_modules", StaticFiles(directory="frontend/node_modules"), name="node_modules")
app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="frontend")
