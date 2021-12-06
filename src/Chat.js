import React, { useEffect, useState } from 'react';
import './Chat.css';
import { Avatar, IconButton, Button } from '@material-ui/core';
import { AttachFile } from '@material-ui/icons';
import MicIcon from '@material-ui/icons/Mic';
import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon';
import { useParams } from 'react-router-dom';
import db from './firebase';
import { useStateValue } from './StateProvider.js';
import firebase from 'firebase/compat/app';
import ImageIcon from '@material-ui/icons/Image';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import LinkIcon from '@material-ui/icons/Link';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import { LinkPreview } from '@dhaiwat10/react-link-preview';
import MenuPopupState from "./MenuPopupState";
import Moment from 'react-moment';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { storage } from './firebase';
import { useHistory } from 'react-router-dom';

function Chat() {
    const [seed, setSeed] = useState("");
    const [input, setInput] = useState("");
    const { roomId } = useParams();
    const [roomName, setRoomName] = useState("");
    const [messages, setMessages] = useState([]);
    const [shareModal, setShareModal] = useState(false);

    const [addLink, setAddLink] = useState(false);
    const [linkVal, setLinkVal] = useState("");
    const [fileAdd, setFileAdd] = useState(false);

    const [caption, setCaption] = useState("");
    const [image, setImage] = useState(null);
    const [progress, setProgress] = useState(0);
    const history = useHistory();

    const [{ user }, dispatch] = useStateValue();

    useEffect(() => {
        setSeed(Math.floor(Math.random() * 5000));
    }, [roomId]);

    useEffect(() => {
        if (roomId) {
            db.collection('rooms').doc(roomId).onSnapshot(snapshot => {
                setRoomName(snapshot.data()?.Name);
            });

            db.collection('rooms').doc(roomId).collection("Messages").orderBy("timestamp", "asc").onSnapshot(snapshot => {
                setMessages(snapshot.docs.map(doc => doc.data()))
            });

        }
    }, [roomId]);

    const sendMessage = (e) => {
        e.preventDefault();
        console.log(input);
        db.collection("rooms").doc(roomId).collection("Messages").add({
            Message: input,
            Name: user.displayName,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        })
        setInput("");
    }

    const linkAdd = () => {
        setShareModal(false);
        setAddLink(true);
    }
    const linkSend = (e) => {
        e.preventDefault();
        if(linkVal===""){
            alert("Insert Link To Send!")
        }else{
            setAddLink(false);
            db.collection("rooms").doc(roomId).collection("Messages").add({
                Message: linkVal,
                Name: user.displayName,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            })
            setLinkVal("");
        }
    }

    function isValidHttpUrl(string) {
        let url;
        if (string.includes("https://firebasestorage.googleapis.com/")) {
            return false;
        }
        try {
            url = new URL(string);
        } catch (_) {
            return false;
        }

        return url.protocol === "http:" || url.protocol === "https:";
    }


    const deleteMessage = (messageToDel) => {
        console.log("deleting")
        db.collection("rooms")
            .doc(roomId)
            .collection("Messages")
            .where("timestamp", "==", messageToDel)
            .get()
            .then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    doc.ref.delete();
                });
            });

    }

    const addFile = () => {
        setShareModal(false);
        setFileAdd(true);
    }


    const handlechange = (e) => {
        // this will pick the FIRST file selected (to avoid selecting many)
        if (e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    }
    const handleUpload = () => {
        if (image !== null) {
            const uploadTask = storage.ref(`files/${image.name}`).put(image);
            // setMessage("Uploading...PLease Wait");
            // setMessageColor("info")
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = Math.round(
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    );
                    console.log("progress" + progress)
                    setProgress(progress);
                },
                (error) => {
                    console.log(error);
                    alert(error.message);
                },
                () => {
                    storage.ref("files").child(image.name).getDownloadURL()
                        .then(url => {
                            //post image inside db
                            db.collection("rooms").doc(roomId).collection("Messages").add({
                                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                                imagename: image.name,
                                Message: url,
                                Name: user.displayName
                            });
                            console.log("done")
                            setProgress(0);
                            setImage(null);
                        })
                    setFileAdd(false);
                }
            )

        } else {
            alert("Enter Image To Proceed")
        }
    }
    const deleteStoreMessage = (message)=>{
        console.log("deleting")
        db.collection("rooms")
            .doc(roomId)
            .collection("Messages")
            .where("timestamp", "==", message.timestamp)
            .get()
            .then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    doc.ref.delete();
                });
            });
        // Get a reference to the storage service, which is used to create references in your storage bucket
        var storage = firebase.storage();

        // Create a storage reference from our storage service
        var storageRef = storage.ref();

        // Create a reference to the file to delete
        var desertRef = storageRef.child('files/' + message.imagename);

        // Delete the file
        desertRef.delete().then(function () {
            // File deleted successfully

        }).catch(function (error) {
            // Uh-oh, an error occurred!
            console.log(error.message);
        });
    }
    const downloadEmployeeData = (downloadLink) => {
        fetch(downloadLink)
            .then(response => {
                response.blob().then(blob => {
                    let url = window.URL.createObjectURL(blob);
                    let a = document.createElement('a');
                    a.href = url;
                    a.download = 'employees.json';
                    a.click();
                });
                //window.location.href = response.url;
        });
    }
    return (
        <div className="chat">
            <div className="chatHeader">
                <Avatar src={`https://avatars.dicebear.com/api/human/${seed}.svg`} />
                <div className="chatHeaderInfo">
                    <h3>{roomName}</h3>
                    <p>Last seen {" "}
                        <Moment fromNow>
                            {messages[messages.length - 1]?.
                                timestamp?.toDate()}
                        </Moment>
                    </p>
                </div>
                <div className="chatHeaderRight">
                </div>
            </div>
            <div className="chatBody">
                {messages.map((message, index) => (
                    <p key={index} className={`chatMessage ${(message.Name === user.displayName) && "chatReceiver"}`}>
                        <span className="chatName">{message.Name}</span>
                        {
                            (user && message.Name === user.displayName) ?
                            (!message["Message"].includes("https://firebasestorage.googleapis.com/")
                            ?
                            <span className="comment__morevert">

                                {/* This is where the 3 dots menu appear to delete comments */}
                                <MenuPopupState
                                    datatopass={message.timestamp}
                                    functiontopass={deleteMessage}
                                    labeltopass={"Delete This Message"}
                                />
                            </span>
                            :
                            <span className="comment__morevert">

                                {/* This is where the 3 dots menu appear to delete comments */}
                                <MenuPopupState
                                    datatopass={message}
                                    functiontopass={deleteStoreMessage}
                                    labeltopass={"Delete This Message"}
                                />
                            </span>)
                            :""
                        }
                        {isValidHttpUrl(message.Message) ?
                            <LinkPreview url={message.Message} width='300px' height='200px' descriptionLength={70} /> :
                            (message["Message"].includes("https://firebasestorage.googleapis.com/") ?
                                <div className="post__imgcontainer">
                                    {
                                        // video or pic
                                        (message["Message"].includes(".pdf")) ? <iframe src={message.Message} style={{width:"600px", height:"500px"}} frameborder="0"></iframe> :
                                        ((message["Message"].includes(".mp4")) || (message["Message"].includes(".MP4")) || (message["Message"].includes(".mov")) || (message["Message"].includes(".MOV"))
                                            ? (
                                                <video width="100%" max-width="500" controls={true} autoPlay={true} loop={true} muted={true} playsInline={true}>
                                                    <source src={message["Message"]} type='video/mp4'></source>
                                                    Your browser does not support the video tag.
                                                </video>
                                            )
                                            
                                                :
                                                (
                                                    // If not video,then image
                                                    <img src={message["Message"]} alt="" className="post_image" />
                                                ))
                                    }

                                </div> :
                                message.Message)
                        }
                        
                        <span className="chatTimestamp">
                            <Moment fromNow>
                                {message.timestamp?.toDate()}
                            </Moment>
                        </span>
                    </p>
                ))}

            </div>
            <div className="chatFooter">
                <form>
                    <input type="text" value={input} placeholder="Type a message" onChange={e => setInput(e.target.value)} />
                    <button type="submit" onClick={sendMessage}>Send a message</button>
                </form>
                <IconButton onClick={() => setShareModal(!shareModal)}>
                    <AttachFile />
                </IconButton>
            </div>
            <Dialog onClose={() => setShareModal(false)} aria-labelledby="simple-dialog-title" open={shareModal}>
                <DialogTitle id="simple-dialog-title">Choose Type Of Item To Share</DialogTitle>
                <div className="shareDialog">
                    <div style={{ display: "flex", marginBottom: "10px", cursor: "pointer" }} onClick={addFile}>
                        <div className="shareIcons"><ImageIcon style={{ color: "white", margin: "3px" }} /></div>
                        <div className="iconNames">Picture</div>
                    </div>
                    {/* <div style={{ display: "flex", marginBottom: "10px", cursor: "pointer" }}>
                        <div className="shareIcons"><LocationOnIcon style={{ color: "white", margin: "3px" }} /></div>
                        <div className="iconNames">Location</div>
                    </div> */}
                    <div style={{ display: "flex", marginBottom: "10px", cursor: "pointer" }} onClick={linkAdd}>
                        <div className="shareIcons"><LinkIcon style={{ color: "white", margin: "3px" }} /></div>
                        <div className="iconNames">Links With Preview</div>
                    </div>
                </div>
            </Dialog>

            <Dialog onClose={() => setAddLink(false)} aria-labelledby="simple-dialog-title" open={addLink}>
                <DialogTitle id="simple-dialog-title">Paste Your Link Here</DialogTitle>
                <div className="shareDialog">
                    <div>
                        <input value={linkVal} onChange={(e) => setLinkVal(e.target.value)} className="linkIp"/>
                    </div>
                    <div>
                        <Button onClick={linkSend} style={{border: "1px solid grey", marginLeft:"90px",marginTop:"41px"}}>Send Link</Button>
                    </div>
                </div>
            </Dialog>

            <Dialog onClose={() => setFileAdd(false)} aria-labelledby="simple-dialog-title" open={fileAdd}>
                <DialogTitle id="simple-dialog-title">Upload File To Send</DialogTitle>
                <div className="shareDialog">
                    <div className="imageupload">
                        <progress value={progress} max="100" className="imageupload__progress" />
                        <input type="file" onChange={handlechange} />
                            <Button style={{border: "1px solid grey", marginLeft:"90px",marginTop:"41px"}} onClick={handleUpload}>
                                Send File
                            </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default Chat
