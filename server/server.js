const mongoose = require('mongoose') // mongoose makes it easier to react with MongoDB
const Document = require('./Document')

mongoose.connect("mongodb://localhost/dist-project-db") // setting up the connection to the MongoDB

const io = require('socket.io')(3001,     // Client is on 3000 and Server is on 3001
    {   // in socket.io cors must be explictly defined for the orgin of the connect "client" and the methods allowed by socket.io  
        cors:   {origin:'http://localhost:3000', 
                methods: ['GET',"POST"],
            },
    })
    const defaultValue= ''
io.on("connect",socket=>{
    socket.on('get-document',async documentId=>{
        const document = await findOrCreateDocument(documentId)
        socket.join(documentId) // pointing the client to the exact documentId
        socket.emit('load-document',document.data)

    
    socket.on('send-changes',delta=>{       // starts to listen to new changes sent from the client "deltas"
        console.log(delta) // track in console the changes happening in the editor by #positon and value and object attrbuite
        socket.broadcast.to(documentId).emit("receive-changes",delta) // thus our current socket broadcasts to other nodes that their are new
                                                                        //changes to be received with the changes value "delta to a specific room
    })
    socket.on('save-document',async data=>{
        await Document.findByIdAndUpdate(documentId,{data}) // searches the doucment by its id then saves it
    })
    })
    console.log("connected")
    
    
})

/*This function creates a Document that was created in the schema in MongoDB/mongoose
This function just searches if the doucment already exsists and returns it if not it creates new one 
with the structure made in the schema*/
async function findOrCreateDocument(id) {
    if (id == null) return
  
    const document = await Document.findById(id)
    if (document) return document
    return await Document.create({ _id: id, data: defaultValue })
  }

