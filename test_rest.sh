#!/bin/bash

echo "Uploading a CGM entry to /entries REST API"
curl -v -d "@data_samples/nightscout/single_cgm.json" -H "accept: application/json" -H "Content-Type: application/json" -X POST http://lhtq0qDMpsm9HIcAkd@dev.lan:8080/api/v1/entries

echo "Uploading a MBG entry to /entries REST API"
curl -v -d "@data_samples/nightscout/single_mbg.json" -H "accept: application/json" -H "Content-Type: application/json" -X POST http://lhtq0qDMpsm9HIcAkd@dev.lan:8080/api/v1/entries

echo "Uploading a wizard entry to /treatments REST API"
curl -v -d "@data_samples/nightscout/single_wizard.json" -H "accept: application/json" -H "Content-Type: application/json" -X POST http://lhtq0qDMpsm9HIcAkd@dev.lan:8080/api/v1/treatments

echo "Loading data from /entries"
curl -v http://lhtq0qDMpsm9HIcAkd@dev.lan:8080/api/v1/entries

echo "Loading data from /treatments"
curl -v http://lhtq0qDMpsm9HIcAkd@dev.lan:8080/api/v1/treatments

echo "Load Entries with limits"
curl -v "http://lhtq0qDMpsm9HIcAkd@localhost:1300/api/v1/entries?count=1&find\[date\]\[\$gt\]=1550575829727&find\[date\]\[\$lt\]=1560575829727"

echo "Loading data from /treatments"
curl -v "http://lhtq0qDMpsm9HIcAkd@dev.lan:8080/api/v1/treatments?count=10\&find\[created_at\]\[\$gt\]=2019-01-01T11%3A30%3A17.694Z"
