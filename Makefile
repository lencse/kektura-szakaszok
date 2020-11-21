.PHONY: test dev watch test lint test_ts test test_compiled
.PHONY: lint_fix watch_test verify compile clean watch_ts watch_data

BIN=node_modules/.bin

default: dist build _data/data.json functions _site

_site: _includes/analytics.html
	bundle exec jekyll build

_includes/analytics.html: build
	node bin/write-analytics.js

dist: build src ejs-templates _data/data.json
	$(BIN)/webpack

clean:
	rm -rf dist build functions .tmp _includes/analytics.html _site

node_modules: package.json yarn.lock
	yarn && touch node_modules

build: src node_modules
	make compile && touch build

_data/data.json: build
	node bin/write-data.js

watch: node_modules
	make clean && make build && ( \
		bundle exec jekyll serve --watch & \
		$(BIN)/tsc -p . --outDir ./build --watch --pretty & \
		$(BIN)/webpack-dev-server & \
		$(BIN)/nodemon bin/write-analytics.js & \
		$(BIN)/nodemon server.js \
	)

watch_data:
	make watch_ts & $(BIN)/nodemon bin/write-data.js

verify: lint test

watch_ts:
	$(BIN)/tsc -p . --outDir ./build --watch --pretty

lint: node_modules
	$(BIN)/tslint -c tslint.json -p .

lint_fix: node_modules
	$(BIN)/tslint -c tslint.json --fix -p .

dev: lint_fix verify

watch_test: node_modules
	$(BIN)/jest --config jest.config.js --watch

compile:
	$(BIN)/tsc -p . --outDir ./build

functions: build _data/data.json download.js
	rm -rf .tmp
	mkdir -p .tmp/functions/download
	cp -r build .tmp/functions/download
	cp -r _data .tmp/functions/download
	cp download.js .tmp/functions/download
	mkdir -p .tmp/functions/map
	cp -r build .tmp/functions/map
	cp -r _data .tmp/functions/map
	cp -r ejs-templates .tmp/functions/map
	cp map.js .tmp/functions/map
	mkdir -p .tmp/functions/planner
	cp -r build .tmp/functions/planner
	cp -r _data .tmp/functions/planner
	cp -r ejs-templates .tmp/functions/planner
	cp planner.js .tmp/functions/planner
	mkdir -p .tmp/functions/download-map
	cp -r build .tmp/functions/download-map
	cp -r _data .tmp/functions/download-map
	cp -r ejs-templates .tmp/functions/download-map
	cp download-map.js .tmp/functions/download-map
	node build-functions.js

test:
	SERVER_PORT=4571 $(BIN)/jest
