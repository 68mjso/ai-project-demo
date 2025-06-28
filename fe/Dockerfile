FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port
EXPOSE 5173

# Command to run the application in development mode
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
