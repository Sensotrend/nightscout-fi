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