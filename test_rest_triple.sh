#!/bin/bash

if [[ "$TEST_SERVER_URL" = "" ]]; then
 echo TEST_SERVER not defined, use use 'export TEST_SERVER_URL=http://secret@foo.com:1234'
 exit
fi

SERVER="$TEST_SERVER_URL"
if [ "${TEST_SERVER_URL: -1}" == "/" ];
then
  SERVER="${TEST_SERVER_URL%?}"
fi

echo "Using server $SERVER"

echo "Uploading triple CGM entry to /entries REST API"
echo Upload outcome: "$(curl -s -d "@data_samples/nightscout/triple_cgm.json" -H "accept: application/json" -H "Content-Type: application/json" -X POST ${SERVER}/api/v1/entries)"

echo "Uploading a MBG entry to /entries REST API"
echo Upload outcome: "$(curl -s -d "@data_samples/nightscout/triple_mbg.json" -H "accept: application/json" -H "Content-Type: application/json" -X POST ${SERVER}/api/v1/entries)"

echo "Uploading a wizard entry to /treatments REST API"
echo Upload outcome: "$(curl -s -d "@data_samples/nightscout/triple_carbs.json" -H "accept: application/json" -H "Content-Type: application/json" -X POST ${SERVER}/api/v1/treatments)"

echo "Uploading a wizard entry to /treatments REST API"
echo Upload outcome: "$(curl -s -d "@data_samples/nightscout/triple_bolus.json" -H "accept: application/json" -H "Content-Type: application/json" -X POST ${SERVER}/api/v1/treatments)"

run_query() {
    echo "Querying: $2 for $3 "
    local results="$(curl -s ${SERVER}/$2)"
    local count="$(echo $results | jq length)"
    echo Expected $1, got "$count"
    if [ "$1" -ne "$count" ];
    then
        echo JSON: $results
    fi
}

run_query 6 "api/v1/entries" "All entries"
run_query 4 "api/v1/entries?count=50&find\[date\]\[\$lt\]=1483311600000" "Load Entries before 1483311600000"
run_query 4 "api/v1/entries?count=50&find\[date\]\[\$gt\]=1483311600000" "Load Entries before 1483311600000"
run_query 2 "api/v1/entries?count=50&find\[date\]\[\$eq\]=1483311600000" "Load Entries on 1483311600000"
run_query 0 "api/v1/entries?count=50&find\[date\]\[\$eq\]=14833600000" "Load Entries on 14833600000"
run_query 2 "api/v1/entries?count=50&find\[date\]\[\$gte\]=1483311600000&find\[date\]\[\$lte\]=1483311600000" "Load Entries between 1483311600000 and 1483311600000"

run_query 6 "api/v1/treatments" "All treatments"
run_query 4 "api/v1/treatments?count=50\&find\[created_at\]\[\$lt\]=2017-01-02T23%3A00%3A00.000Z" "Load Treatments before 2017-01-02T23%3A00%3A00.000Z"
run_query 4 "api/v1/treatments?count=50\&find\[created_at\]\[\$gt\]=2017-01-02T23%3A00%3A00.000Z" "Load Treatments before 2017-01-02T23%3A00%3A00.000Z"
run_query 2 "api/v1/treatments?count=50\&find\[created_at\]\[\$gt\]=2017-01-02T22%3A59%3A00.000Z&find\[created_at\]\[\$lt\]=2017-01-02T23%3A01%3A00.000Z" "Load Treatments between 2017-01-02T22%3A59%3A00.000Z and 2017-01-02T23%3A01%3A00.000Z"

exit

echo "Loading data from /entries"
echo Expecting 6 Entries, got "$(curl -s ${TEST_SERVER_URL}/api/v1/entries | jq length)"

echo "Loading data from /treatments"
echo Expecting 6 Treatments, got "$(curl -s ${TEST_SERVER_URL}/api/v1/treatments | jq length)"

echo "Load Entries before 1483311600000"
echo Expecting 4 Entries, got "$(curl -s "${TEST_SERVER_URL}/api/v1/entries?count=50&find\[date\]\[\$lte\]=1483311600000" | jq length)"

echo "Load Entries after 1483311600000"
echo Expecting 4 Entries, got "$(curl -s "${TEST_SERVER_URL}/api/v1/entries?count=50&find\[date\]\[\$gte\]=1483311600000" | jq length)"

echo "Load Entries after 1483311600000"
echo Expecting 2 Entries, got "$(curl -s "${TEST_SERVER_URL}/api/v1/entries?count=50&find\[date\]\[\$eq\]=1483311600000" | jq length)"

echo "Load Entries with wrong eq"
echo Expecting 0 Entries, got "$(curl -s "${TEST_SERVER_URL}/api/v1/entries?count=50&find\[date\]\[\$eq\]=14833600000" | jq length)"

echo "Load Entries on 1483311600000"
echo Expecting 2 Entries, got "$(curl -s "${TEST_SERVER_URL}/api/v1/entries?count=50&find\[date\]\[\$gte\]=1483311600000&find\[date\]\[\$lte\]=1483311600000" | jq length)"

echo "Loading data from /treatments"
echo Expecting 4 Treatments, got "$(curl -s "${TEST_SERVER_URL}/api/v1/treatments?count=50\&find\[created_at\]\[\$lte\]=2017-01-02T23%3A00%3A00.000Z" | jq length)"

echo "Loading data from /treatments"
echo Expecting 4 Treatments, got "$(curl -s "${TEST_SERVER_URL}/api/v1/treatments?count=50\&find\[created_at\]\[\$gte\]=2017-01-02T23%3A00%3A00.000Z" | jq length)"

echo "Loading data from /treatments"
echo Expecting 2 Treatments, got "$(curl -s "${TEST_SERVER_URL}/api/v1/treatments?count=50\&find\[created_at\]\[\$gt\]=2017-01-02T22%3A59%3A00.000Z&find\[created_at\]\[\$lt\]=2017-01-02T23%3A01%3A00.000Z" | jq length)"
