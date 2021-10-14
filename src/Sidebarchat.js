import React, { useEffect, useState } from 'react';
import './Sidebarchat.css';
import { Avatar } from "@material-ui/core";
import db from './firebase';
import { Link } from 'react-router-dom';


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
                    <p>{messages[0]?.Message}</p>
                </div>
            </div>
        </Link>
    ) : (
        <div onClick={createChat} className="sidebarChat">
            <h2>Add New Chat</h2>
        </div>
    )
}

export default Sidebarchat
