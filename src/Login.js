import React from 'react';
import { Button } from '@material-ui/core';
import './Login.css';
import { auth ,provider} from './firebase';
import {useStateValue} from './StateProvider';
import { actionTypes } from './reducer';

function Login() {
    const [{},dispatch] = useStateValue();
    const signIn = ()=>{
        auth.signInWithPopup(provider)
        .then(result =>{
            dispatch({
                type: actionTypes.SET_USER,
                user: result.user
            })
        })
        .catch(error=>alert(error.message));
    };
    return (
        <div className="login">
            <div className="login_container">
                <img src="https://icon-library.com/images/text-message-app-icon/text-message-app-icon-25.jpg" alt="" />
                <div className="login_text">
                    <h1>Sign in to Chat App</h1>
                </div>
                <Button type="submit" onClick={signIn}>Sign in With Google</Button>
            </div>
        </div>
    )
}

export default Login
