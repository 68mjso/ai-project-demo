#!/bin/bash

if [[ "$1" == "dev" ]]; then
    PYTHONPATH=./src uvicorn src.main:app --host 0.0.0.0 --port 3000 --reload
else
    PYTHONPATH=./src uvicorn src.main:app --host 0.0.0.0 --port 3000
fi
