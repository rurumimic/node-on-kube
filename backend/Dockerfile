FROM node:12-alpine

WORKDIR /usr/src/app
ENV NODE_ENV production

COPY package.json ./
COPY yarn.lock ./

# For a secure corporate network
# Remove this line in a production envrionment
RUN yarn config set "strict-ssl" false

RUN yarn

COPY . .

EXPOSE 3000

CMD [ "yarn", "start" ]

###

# docker build -t express-app .
# docker run --rm --name backend -p 3000:3000 -d express-app
