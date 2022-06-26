# Collaborative Documents Project - Distributed Systems
A real-time collaborative text editor mimicking the style of Google Docs, Project is meant to allow users to edit documents in real-time and save these documents to a database. Users can also be on different documents with unique IDs without any interference of data thus to say every document with its unique id is completely independent of other documents and only affected by the user connected in that room “id would be explained in detail later on”.
The project is designed as a React application using NodeJS / async js and MongoDB.

# Install before running:
- MongoDB
- Node JS

# How to run the client and server
1.	Open a new terminal in client folder
2.	Type npm run start
3.	Open another terminal in server folder
4.	Type npm run devStart

# Client dependencies
- npm i quill
- npm i socket.io-client
- npm i react-router-dom
- npm i uuid

# Server dependencies
- npm i socket.io
- npm i --save-dev nodemon
- npm i- mongoose
