# Makefile to build the Go server and React UI

.PHONY: all server ui clean


all: ui server

SERVER_DIR := appserver
UI_DIR := appui
SERVER_DIST_DIR := $(SERVER_DIR)/dist
UI_DIST_DIR := $(UI_DIR)/dist

SERVER_EXECUTABLE := math-games
SERVER_EXECUTABLE_WINDOWS := math-games.exe
SERVER_OUTPUT_DIR := build

server: $(SERVER_OUTPUT_DIR)/$(SERVER_EXECUTABLE) $(SERVER_OUTPUT_DIR)/$(SERVER_EXECUTABLE_WINDOWS)

$(SERVER_OUTPUT_DIR)/$(SERVER_EXECUTABLE):
	mkdir -p $(SERVER_OUTPUT_DIR)
	cd $(SERVER_DIR) && GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o $(SERVER_OUTPUT_DIR)/$(SERVER_EXECUTABLE)

$(SERVER_OUTPUT_DIR)/$(SERVER_EXECUTABLE_WINDOWS):
	mkdir -p $(SERVER_OUTPUT_DIR)
	cd $(SERVER_DIR) && GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o $(SERVER_OUTPUT_DIR)/$(SERVER_EXECUTABLE_WINDOWS)


ui:
	rm -rf $(UI_DIST_DIR) $(SERVER_DIST_DIR)
	cd $(UI_DIR) && npm install && npm run build
	cp -r $(UI_DIST_DIR) $(SERVER_DIR)

clean:
	cd $(SERVER_DIR) && go clean && rm -rf $(SERVER_OUTPUT_DIR)
	cd $(UI_DIR) && npm run clean
