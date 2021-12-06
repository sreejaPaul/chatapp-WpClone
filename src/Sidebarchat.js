import React, { useEffect, useState } from 'react';
import './Sidebarchat.css';
import { Avatar } from "@material-ui/core";
import db from './firebase';
import { Link } from 'react-router-dom';
import PhotoIcon from '@material-ui/icons/Photo';
import AddCircleIcon from '@material-ui/icons/AddCircle';

function Sidebarchat({ addNewChat, id, name }) {
    const [seed, setSeed] = useState("");
    const [messages, setMessages] = useState("");
    
    useEffect(() => {
        if(id){
            db.collection('rooms').doc(id).collection('Messages').orderBy('timestamp','desc').onSnapshot(snapshot => {
                setMessages(snapshot.docs.map((doc) => doc.data()))
            })
        }
    }, [id]);

    useEffect(() => {
        setSeed(Math.floor(Math.random() * 500));
    }, [])
    const createChat = () => {
        const roomName = prompt("Please enter name for chat: ");
        if (roomName) {
            db.collection("rooms").add({
                Name: roomName,
            })
        }
    }
    return !addNewChat ? (
        <Link to={"/room/" + id}>
            <div className="sidebarChat">
                <Avatar src={`https://avatars.dicebear.com/api/human/${seed}.svg`} />
                <div className="sidebarChatInfo">
                    <h2>{name}</h2>
                    <p>{(messages[0]?.Message.includes(".jpeg") || messages[0]?.Message.includes(".jpg") || messages[0]?.Message.includes(".png")) ? 
                        <div style={{display:"flex"}}>
                            <div><PhotoIcon style={{color:"grey"}}/></div>
                            <div>{"Photo"}</div>
                        </div>
                        : messages[0]?.Message}</p>
                </div>
            </div>
        </Link>
    ) : (
        <div onClick={createChat} className="sidebarChat">
            <div style={{display:"flex"}}>
                <div><AddCircleIcon style={{color:"grey"}}/></div>
                <div style={{marginLeft: "10px",color:"grey"}}><h4>Add New Chat</h4></div>
            </div>
        </div>
    )
}

export default Sidebarchat
