
# Nightscout tests/builds/analysis
TESTS=tests/*.js
MONGODB_URI?=mongodb://localhost:27017/test_db
CUSTOMCONNSTR_mongo_collection?=test_nsfi
TOKEN_ENCRYPTION_KEY=testtesttesttest
FHIR_SERVER=http://hapi.fhir.org/baseDstu3
TEST_SETTINGS=MONGODB_URI=${MONGODB_URI} TOKEN_ENCRYPTION_KEY=${TOKEN_ENCRYPTION_KEY} FHIR_SERVER=${FHIR_SERVER}\
	CUSTOMCONNSTR_mongo_collection=${CUSTOMCONNSTR_mongo_collection}

MOCHA=./node_modules/mocha/bin/_mocha --require esm 
# Pinned from dependency list.
ISTANBUL=./node_modules/.bin/istanbul
ANALYZED=./coverage/lcov.info

all: test

coverage:
	NODE_ENV=test ${TEST_SETTINGS} \
	${ISTANBUL} cover ${MOCHA} -- --timeout 15000 -R tap ${TESTS}

report:
	test -f ${ANALYZED} && \
	(npm install coveralls && cat ${ANALYZED} | \
	./node_modules/.bin/coveralls) || echo "NO COVERAGE"
	test -f ${ANALYZED} && \
	(npm install codacy-coverage && cat ${ANALYZED} | \
	YOURPACKAGE_COVERAGE=1 ./node_modules/codacy-coverage/bin/codacy-coverage.js) || echo "NO COVERAGE"

test_onebyone:
	python -c 'import os,sys,fcntl; flags = fcntl.fcntl(sys.stdout, fcntl.F_GETFL); fcntl.fcntl(sys.stdout, fcntl.F_SETFL, flags&~os.O_NONBLOCK);'
	$(foreach var,$(wildcard tests/*.js),${TEST_SETTINGS} ${MOCHA} --timeout 30000 --exit --bail -R tap $(var);)

test:
	${TEST_SETTINGS} ${MOCHA} --timeout 30000 --exit --bail -R tap ${TESTS}

travis:
	python -c 'import os,sys,fcntl; flags = fcntl.fcntl(sys.stdout, fcntl.F_GETFL); fcntl.fcntl(sys.stdout, fcntl.F_SETFL, flags&~os.O_NONBLOCK);'
#	NODE_ENV=test ${TEST_SETTINGS} \
#	${ISTANBUL} cover ${MOCHA} --report lcovonly -- --timeout 5000 -R tap ${TESTS}	
	$(foreach var,$(wildcard tests/*.js),${TEST_SETTINGS} ${MOCHA} --timeout 30000 --exit --bail -R tap $(var);)

.PHONY: all coverage docker_release report test travis
