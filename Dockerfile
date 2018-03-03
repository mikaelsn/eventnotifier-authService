FROM node:latest

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install --production

# Bundle app source
COPY . /usr/src/app

EXPOSE 5858
EXPOSE 8083

RUN npm install --production
CMD ["node", "--debug=5858","app.js"]