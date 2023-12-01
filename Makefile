
SHELL := /bin/bash

export DB_HOST ?= localhost
export DB_PORT ?= 27017
#should provide by centralized credentials manager, such as AWS secret manager, github environment secret etc.
export DB_USERNAME ?= mongo
export DB_PASSWORD ?= mongo


DOCKER_COMPOSE_AVAILABLE := $(shell docker-compose -v 2> /dev/null)

ifdef DOCKER_COMPOSE_AVAILABLE
	DOCKER_COMPOSE := docker-compose
else
	DOCKER_COMPOSE := docker compose
endif

refresh:
	${DOCKER_COMPOSE} up --detach --remove-orphans --build
logs:
	${DOCKER_COMPOSE} -f docker-compose.yaml logs -f
start:
	${DOCKER_COMPOSE} -f docker-compose.yaml start
stop:
	${DOCKER_COMPOSE} -f docker-compose.yaml stop
down:
	${DOCKER_COMPOSE} -f docker-compose.yaml down