std:
	bunx drizzle-kit studio

migrate:
	bun run migrate

dd:
	docker-compose -f ./docker-compose.dev.yml up

ddb:
	docker-compose -f ./docker-compose.dev.yml up --build

format:
	bun format && bun lint
