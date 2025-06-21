---
title: Docker
---

In a lot cases, we build our application using Docker so we can host it somewhere else.

We can achieve that in various ways but maybe the most optimal one would be by using a technique called [Multi-stage builds](https://docs.docker.com/build/building/multi-stage/), which consist on having a couple of layers preparing the application and at the end, build an image only the production code of our app, here's an example:
