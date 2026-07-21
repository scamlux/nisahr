# CareerOS SearXNG — thin layer over the official image that bakes in our
# settings.yml (JSON API on, limiter off). The upstream entrypoint substitutes
# the "ultrasecretkey" placeholder with $SEARXNG_SECRET on start.
FROM searxng/searxng:latest

COPY settings.yml /etc/searxng/settings.yml

# The image serves on 0.0.0.0:8080 by default; Render routes to $PORT=8080 (render.yaml).
EXPOSE 8080
