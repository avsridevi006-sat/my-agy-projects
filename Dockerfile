# Use the official Nginx image based on Alpine Linux for a small footprint
FROM nginx:alpine

# Copy the static website files to the default Nginx html directory
COPY . /usr/share/nginx/html

# Expose port 80 to the outside world
EXPOSE 80

# The default command of the nginx image starts the server, so we don't need a CMD
