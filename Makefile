.PHONY: setup run test lint clean

setup:
	./bin/setup.sh

run:
	./bin/run.sh

test:
	pytest

lint:
	ruff check .

clean:
	rm -rf __pycache__ .pytest_cache
