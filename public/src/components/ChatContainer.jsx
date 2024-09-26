import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { sendMessageRoute, recieveMessageRoute } from "../utils/APIRoutes";

export default function ChatContainer({ currentChat, socket, firebaseToken,  }) {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const oAuth = "ya29.c.c0ASRK0GYJCyvOrXjZECA6x-JTgaJ5zcsBh-v_qVxaGq0ltuWp29UXBPp9DtIyGlo5z0E4Gfsq4VEymjomevFdvhCpnHZsm1h85zcw5Rbo-au-Ua7PISLmG38KkCE8WXLuwit03Er4fpeg62du4hIGko_-Edzh7-uqRbAPn9GAeTeIrvuZE4mxSj0qUCHiIwnjIbSfRG5MSxxufR7v_2Sehe5--70TXFGHxB2PNY-wPMRFQAGczNODHPQm33tbJuYfDgilFbnGPXOJa4jdGSxKqWbXFhWXIHUe59L83nU5G_EH9dm8qSeCqmlRvPslg_Y7TiLzJ0aMXHSVSePMarkunLQX-iIlHSkMPIDU3qUljdpzunKPiY1XaupLG385An1lz8RxYt-uWFVzXJFamRyYV6SnlvocVcyWFt-6eebS7fj65M0bcuoQldMhRg5v1k83les8r_O-S6pb89S6wSq82wvpaXFsYfUot7BWXf9vnSFJzhtU9FUWXRgvg6_sB8xVIbbg6Y4652Ut7OW9ph7OfesocZfo5vOFmxJ2mc1ZfjmFev361ns492uo9cFZl5mg0j4utggw_x_bsFfJwdxgpjU2Oiyp1Rx4iqhXxVrrOJXsu8ZZUxxQqz7-q89yVvj8tn6pd9dstzr6oq05Wla0pvf8OlO7kv1u9RavFR3ZWIWoe4Jf9QgQj7QyIOpSJXbauoddn_1Fku-USU4gaqfaW14y4et3Q5f44xFlwmZ8IsZ-U-RSteVV85-97JujuI7hqR5tkXi1Bo56RnMU9keurh23l9m0U49Z3QOVd-3gaf15vRV_k1Ww8nZuMklyy9jkJ1VS5872i6ZBsn5j6ddJ_d0l8O7gJUyQ9ZolgjY34hw2QB-7Rsmqd27M9doyjl9jf_qdUc7vaFRBw2yvuVpzxnm1tBmJdxk8g-IWoz8c2l6ZWfnIwUVyggrQBXMlVvueW8veFooZ0p6cZWnv3ke4UnnWbe20S07y0bv-QrkSjpf2wfqx2drI5nf"


  const sendNotification = async (accessToken, message) => {
    const url =
      "https://fcm.googleapis.com/v1/projects/notification-cf86e/messages:send";

    const body = {
      message: {
        token: firebaseToken,
        notification: {
          title: message.title,
          body: message.body,
        },
      },
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${oAuth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Notification sent successfully:", data);
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  };


  useEffect(async () => {
    const data = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );
    const response = await axios.post(recieveMessageRoute, {
      from: data._id,
      to: currentChat._id,
    });
    setMessages(response.data);
  }, [currentChat]);

  useEffect(() => {
    const getCurrentChat = async () => {
      if (currentChat) {
        await JSON.parse(
          localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
        )._id;
      }
    };
    getCurrentChat();
  }, [currentChat]);

  const handleSendMsg = async (msg) => {
    const data = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );
    socket.current.emit("send-msg", {
      to: currentChat._id,
      from: data._id,
      msg,
    });
    await axios.post(sendMessageRoute, {
      from: data._id,
      to: currentChat._id,
      message: msg,
    });

    const url =
    "https://fcm.googleapis.com/v1/projects/notification-cf86e/messages:send";

  const body = {
    message: {
      token: firebaseToken,
      notification: {
        title: currentChat.username,
        body: msg,
      },
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${oAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Notification sent successfully:", data);
  } catch (error) {
    console.error("Failed to send notification:", error);
  }

    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: msg });
    setMessages(msgs);
  };

  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-recieve", (msg) => {
        setArrivalMessage({ fromSelf: false, message: msg });
      });
    }
  }, []);

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Container>
      <div className="chat-header">
        <div className="user-details">
          <div className="avatar">
            <img
              src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
              alt=""
            />
          </div>
          <div className="username">
            <h3>{currentChat.username}</h3>
          </div>
        </div>
        <Logout />
      </div>
      <div className="chat-messages">
        {messages.map((message) => {
          return (
            <div ref={scrollRef} key={uuidv4()}>
              <div
                className={`message ${
                  message.fromSelf ? "sended" : "recieved"
                }`}
              >
                <div className="content ">
                  <p>{message.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ChatInput handleSendMsg={handleSendMsg} />
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar {
        img {
          height: 3rem;
        }
      }
      .username {
        h3 {
          color: white;
        }
      }
    }
  }
  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .message {
      display: flex;
      align-items: center;
      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
      }
    }
    .sended {
      justify-content: flex-end;
      .content {
        background-color: #4f04ff21;
      }
    }
    .recieved {
      justify-content: flex-start;
      .content {
        background-color: #9900ff20;
      }
    }
  }
`;
