FROM node:12

COPY ./schnauzer/package*.json ./

RUN npm ci
RUN npm i -g typescript

COPY ./schnauzer .
RUN npm run build && \
    rm -r ./src && \
    rm ormconfig.ts && \
    cp -r ./build/* ./

EXPOSE 8080

CMD ["node", "src"]