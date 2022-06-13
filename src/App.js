import React from "react";

import { FieldValues, useForm } from "react-hook-form";

import { Box, ButtonBase, Container, TextField } from "@mui/material";

import axios from "axios";
import Pusher from "pusher-js";

const Chat = () => {
  const [text, setText] = React.useState("");
  const [chats, setChats] = React.useState([]);
  const chatsRef = React.useRef(chats);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const onSubmit = (values) => {
    const payload = {
      text: values?.text ?? "No text",
    };
    axios.post("https://1cce-182-188-104-128.ngrok.io/api/pusher/", payload);
  };

  React.useEffect(() => {
    const pusher = new Pusher("28a9f66d46070751a162", {
      cluster: "mt1",
      channelAuthorization: {
        endpoint: "https://1cce-182-188-104-128.ngrok.io/api/pusher/",
        transport: "ajax",
      },
    });

    pusher.connection.bind("connected", () => {
      const socketId = pusher.connection.socket_id;
      console.log("connected", socketId);
      const channel = pusher.subscribe("private-chat");
      channel.bind("event_name", function (data) {
        console.log("on new message", chats, chatsRef?.current, data);
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
          <p key={index}>
            ({index + 1}) -- {_c?.text}
          </p>
        ))}
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField value={text} onChange={(e) => setText(e.target.value)} />
          <ButtonBase type="submit">Submit</ButtonBase>
        </form>
      </Container>
    </>
  );
};

export default Chat;
