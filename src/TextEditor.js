import Quill from 'quill'
import "quill/dist/quill.snow.css"
import { useCallback,useEffect,useState} from 'react'
import {io} from "socket.io-client"
import { useParams } from 'react-router-dom'


const SAVE_INTERVAL_MS = 2000
export default function TextEditor() {
    // the decelration of the document id by using the useParams to direct the client to the correct URL found in App.js router
    const {id: documentId} = useParams()
    //Declaring socket and quill as a state variables so server can use them and states be updated
    const [socket,setSocket]= useState()
    const [quill,setQuill]= useState()

    /* Here Quill text editor is being generated for one time only 
      Callback hook is used instead of useEffect hook is guarantee that
      Quill object is generated correctly before any other DOM elements or 
      functions being called to avoid any overlapping of quill objects after
      multiple saves or changes to the document. So this wait for the wrapperRef to be
      fully rendered then running this useCallback to append quill to container div */
      const wrapperRef =useCallback((wrapper)=>{                
        if(wrapper == null) return        // checking for wrapper                   
        wrapper.innerHTML=""              /* useCallback doesn't have clean up like useEffect so we must manually clean up                    
                                          to reset our code*/ 
        const editor = document.createElement("div")
        wrapper.append(editor)
        const q= new Quill(editor,{theme : "snow"})
        q.disable() //disable quill before the docuemnt is loaded and the server connection is established
        q.setText("Docuemnt is Currently Loading, Waiting for server connection")
        setQuill(q)
        },[])


    // Here connection happens between the client and the server
    useEffect(() => {
        const s = io("http://localhost:3001") // Establishing connection from Client to Host
        setSocket(s)
    
        return () => {
          s.disconnect() // clean up just disconnects the client from the server
        }
      }, []) // [] is used to make this useEffect run only 1 time to establish one connection from 1 client to the server



      // 
    /*Here is where text change being handled, quill has an API event called text-change 
    deltas are a small subset of the document that is being changed so whenver the user
    types in a change in the editor the text-change on invokes the handler which sends 
    the new delta to the server*/
    useEffect(()=>{
      if (socket == null || quill==null) return // primary check since socket and quill aren't defined on the startup of the code
      const handler =(delta,oldDelta,source)=>{
          if(source !== "user") return // checking if the user made a change on the text editor not the libraries themself
          socket.emit("send-changes",delta) // send from the client to the server the new delta"changes" that happended by the user
      }

      quill.on('text-change',handler) // whenever text changes happens invokes handler with the new delta
      return()=>{
          quill.off('text-change',handler) // when off invokes handler with no new deltas 
      }
      },[socket,quill]) // depends on the states of socket and quill 
     
     
      //
      /*Here is where receiving changes from the server being handled, after third useEffect the server listented to
      the changes that happens to the new delta and old ones and now the server sends backs the new changes to the editor
      Hence from here multiple users can see whats being updated in the editor in real-time  */
    useEffect(()=>{
      if (socket == null || quill==null) return // primary check since socket and quill aren't defined on the startup of the code
      const handler =(delta)=>{   // the new delta sent from the server on receive changes
          quill.updateContents(delta) // update contents of quill with the new deltas
      }

      socket.on('receive-changes',handler)
      return()=>{
          socket.off('receive-changes',handler)
      }
      },[socket,quill]) // depends on the states of socket and quill

      
      
      /*Here setting up the correct room for the user navigating in the router is being handled as it sends to the server
      the docuemntId so the server can link the user to the correct room or if the document is saved the server would send
      the document back to the client */
    useEffect(() => {
        if (socket == null || quill == null) return
    
        socket.once("load-document", document => { // here client listens only one time to the server if the document is already saved 
          quill.setContents(document)              // the server loads back the doucemnt
          quill.enable()
        })
    
        socket.emit("get-document", documentId) // sending to the server get-document so it can load quill up and set the correct room after.
      }, [socket, quill, documentId]) // depends on the states of socket ,quill and documentId
    
    
    
      
    /*Saving documents happens here, automatically saving the doucment by defined values in ms */
      useEffect(() => {
        if (socket == null || quill == null) return
    
        const interval = setInterval(() => {
          socket.emit("save-document", quill.getContents())
        }, SAVE_INTERVAL_MS)
    
        return () => {
          clearInterval(interval)
        }
      }, [socket, quill])
      

    
     


  return <div className="container" ref={wrapperRef}></div>  
  
}
