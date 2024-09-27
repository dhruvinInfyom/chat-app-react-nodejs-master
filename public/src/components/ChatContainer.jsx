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
  const oAuth = "ya29.c.c0ASRK0GbhxBuUNQaNhjcYt6MxYTOsAP0u0Iemt6L1ZblgLZ7O22iODtrLp6WJ_LOKFjN-t7fxHpO1LBb4-LP4qDBjqM0-zwvbIC4ww_d4iZ7Yw6oMAJa_dwCjs70CzKNZM794IF9XDxtWAOfgSR6T119kvmtd7SJQmYCsTOOmCBhu8MGFbtsvJYy8yjYdJkPaXDTSyIUvdRPNjVy81z5sh_icOrfQJaHacDcg-EX81tnMPgpoiRe15fu-6hNe_wSK_hgqQEXYu1YydB0Ogt2heu_oZctxmsRhc9rnre8w6VuyCUJvnXrsDT_me0wCyy2Zgko5y3vw2xbtNuLqxJ7D07-7iQ5xZTEJ96fjDMFmWpqbdLcTsIIoTecdKgT387Pra1swbpgrIS1hZnWs2-VfFM9oZQ44sQxJjt7k-q5hX0jQRknO-rMY5s-O7pUbU7wv3jrIpaFojoJ3uxcrOsJY-a7lS7R1tj177ZVdqxujt1UR6c4n_Mn6R5zuMv9axqajR-Ycyc6oX4O6gZ_WZYineUjiZdvOc6s931Vf-V1akq1ZwydchVYQp2qqSpxbxjm-U8l9-BgZwYVRjUOZRk2XXlmFuiOfwYa5e0kB83-lptWMq4hBvow16fSagIaUyscnV0qFJtO_M1xYt_b9wVq_qrv-0z4xI9-m6zqzawQyBazqFhsjkkZUxzrSypbz3uzXs2RZke7RSOjcr01nfWBlnm91fanu7c5z8e5b6IRb7fhZfXoUsOivanuzyxcad-hW6wlZuyk17yQ-5YXfdVcZghn1zn57o8WZryFBvnlu7jYJUneF-7dJW4Msu04g2nYBw6UjZ_plR3F4OUft9fO5vO_cg5whfO1RqW-YdfpSh7Fqggz4zQcs4VBkQenx0Iec3Vvm1__zU2SuRzpSRpXSieOysSIYO4os4XBg6pkxF5YIFMaBsdw3ZVYhc1i40rY8_eyzabrWSZe6n55gp5dSRVgRZR8j-JYSR29kx_Bfs3i23J8kggF6rJ6"

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
      token: currentChat.deviceToken,
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
