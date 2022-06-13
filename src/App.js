import React from "react";

import { FieldValues, useForm } from "react-hook-form";

import {
  Box,
  Button,
  Container,
  ListItem,
  ListItemText,
  TextField,
} from "@mui/material";

import axios from "axios";
import Pusher from "pusher-js";

const EVENT_NAME = "bookingMessage";
const CHANNEL_NAME = "private-chat";
const baseURL = "https://6709-182-188-104-128.ngrok.io";
const messageEndpoint = "api/pusher/message/";
const PUSHER_KEY = "28a9f66d46070751a162";

const Chat = () => {
  const [text, setText] = React.useState("");
  const [chats, setChats] = React.useState([]);
  const chatsRef = React.useRef(chats);
  const [socketId, setSocketId] = React.useState(null);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const onSubmit = (values) => {
    const payload = {
      channel_name: CHANNEL_NAME,
      socket_id: socketId,
      text,
    };
    axios.post(`${baseURL}/${messageEndpoint}`, payload).then(() => {
      setChats([...chats, payload]);
    });
  };

  React.useEffect(() => {
    const pusher = new Pusher(PUSHER_KEY, {
      cluster: "mt1",
      channelAuthorization: {
        endpoint: `${baseURL}/api/pusher/`,
        transport: "ajax",
      },
    });

    pusher.connection.bind("connected", () => {
      const socketId = pusher.connection.socket_id;
      console.log("connected", socketId);
      setSocketId(socketId);
      const channel = pusher.subscribe("private-chat");
      channel.bind(EVENT_NAME, function (data) {
        setChats([...(chatsRef?.current ?? []), data]);
      });
    });

    return () => {
      pusher.disconnect();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  console.log("the chats are ---", chats);

  return (
    <>
      <Container>
        <Box>Messages</Box>
        {chats?.map((_c, index) => (
          <ListItem key={index}>
            <ListItemText primary={`(${index + 1}) : ${_c?.text}`} />
          </ListItem>
        ))}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box>
            <TextField value={text} onChange={(e) => setText(e.target.value)} />
            <Button variant="outlined" type="submit">
              Submit
            </Button>
          </Box>
        </form>
      </Container>
    </>
  );
};

export default Chat;
