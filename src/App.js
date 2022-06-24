import React, { useRef, useState } from "react";
import "./App.css";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

//firebase Hooks
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyBkVauKUxSVaeg0h-rvbvei5UcJ8fRMGIE",
  authDomain: "fir-chat-f5407.firebaseapp.com",
  projectId: "fir-chat-f5407",
  storageBucket: "fir-chat-f5407.appspot.com",
  messagingSenderId: "242511410858",
  appId: "1:242511410858:web:a2d70d602caff44f6ac2d3",
  measurementId: "G-3W9JMM0N7G",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header className="App-header">
        <h1>Firebase Chat</h1>
        <SignOut />
      </header>
      <SignOut />
      {/* If the user is signed in "user" will return an object, else null */}
      <section>{user ? <ChatRoom /> : <SignIn />} </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
      <p>
        Do not violate the community guidelines or you will be banned for life!
      </p>
    </>
  );
}
function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}
function ChatRoom() {
  const dummy = useRef();

  //make a reference to a firestore collection
  const messagesRef = firestore.collection("messages");

  //make a query to the collection, orderBy created time and limited to 25 messages
  const query = messagesRef.orderBy("createdAt").limit(25);

  //make this query and then listen fo changes using useCollectionData hook
  //returns an array of objects where each object is the chat message in the database
  const [messages] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    if (formValue !== "") {
      e.preventDefault();
      const { uid, photoURL } = auth.currentUser;

      //Adds message to database
      await messagesRef.add({
        text: formValue,
        //gets timestamp from server
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL,
      });
      //once complete, returns the form value back to an empty string
      setFormValue("");

      dummy.current.scrollIntoView({ behavior: "smooth" });
    }
    e.preventDefault();
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
      </main>
      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
        />
        <button type="submit" />
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt="user Avatar" />
      <p>{text}</p>;
    </div>
  );
}
export default App;
