FROM node:12

WORKDIR ./

ENV DB_HOST $DB_HOST
ENV DB_PORT $DB_PORT
ENV DB_USER $DB_USER
ENV DB_PASSWORD $DB_PASSWORD
ENV DB_NAME $DB_NAME
ENV SERVER_PORT $SERVER_PORT
ENV JWT_SECRET $JWT_SECRET

COPY ./schnauzer/package*.json ./

RUN npm ci
RUN npm i -g typescript

COPY ./schnauzer .

EXPOSE 8080
RUN npm start