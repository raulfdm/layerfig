# Layerfig: Multi-staged Docker Example

## Getting started

Install dependencies:

```bash
npm i
```

Run the server:

```bash
npm run dev
```

## Running the container

First, build the image:

```bash
docker build -t layerfig-docker-example .
```

Now, run the container:

```bash
docker run -it --rm -p 5173:5173 layerfig-docker-example
```
