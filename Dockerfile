# Use Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install serve globally for serving static files
RUN npm install -g serve

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install --production

# Copy all files
COPY . .

# Expose port 3000
EXPOSE 3000

# Remove X-Frame-Options header restriction
ENV SERVE_SINGLE_PAGE=false

# Start the application
CMD ["serve", "-s", ".", "-l", "3000", "--no-clipboard"]