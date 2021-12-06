import React, { useState } from 'react';
import './App.css';
import Sidebar from './Sidebar';
import Chat from './Chat';
import { Route, useHistory} from 'react-router-dom';
import Login from './Login';
import { useStateValue } from './StateProvider';
import { getAuth, signOut} from './firebase';

function App() {
  const[{user},dispatch] = useStateValue();
  const history = useHistory();
  const signUserOut = ()=>{
    const auth = getAuth();
    signOut(auth).then(() => {
      console.log(" Sign-out successful.")
      history.push('/')
      window.location.reload();
    }).catch((error) => {
      console.log("An error happened.")
    });
  }
  return (
    <div className="app">
      <div style={{display: "inline"}}>
        {user ?  <button onClick={signUserOut} className="logOutBtn">Log Out</button> : ""}
      </div>
      <div className="appBody">
        {!user ? (<Login/>) :
          (
            <>
              <Sidebar />
              <Route path="/" exact>
                <div style={{padding: "30px"}}>
                  <h4 style={{fontStyle:"italic"}}>Click Any Room From Left And Start Chatting</h4>
                </div>
              </Route>
              <Route path="/room/:roomId" exact>
                <Chat />
              </Route>
            </>)
        }
      </div>
    </div>
  );
}

export default App;
