import React, { useState } from 'react';
import './App.css';
import Sidebar from './Sidebar';
import Chat from './Chat';
import { Route } from 'react-router-dom';
import Login from './Login';
import { useStateValue } from './StateProvider';

function App() {
  const[{user},dispatch] = useStateValue();
  return (
    <div className="app">
      <div className="appBody">
        {!user ? (<Login/>) :
          (
            <>
              <Sidebar />

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
