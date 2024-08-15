dd:
	docker compose -f ./docker-compose.dev.yml up

ddb:
	docker compose -f ./docker-compose.dev.yml up --build

build:
	bun bun build

format:
	bun format && bun lint

g:
	bunx prisma generate

db:
	bunx prisma db push

std:
	bunx prisma studio

seed:
	bunx prisma db seed
