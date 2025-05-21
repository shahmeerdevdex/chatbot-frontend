import { Box } from "@mui/material";

import { bot, redMic, redStop } from "../assets";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useStateContext } from "../context/AppContext";
import { useQuery } from "react-query";
import { PageLoading } from "./ScreenLoader";
import { fetchAgentDetails } from "../services/agent";
import { useSnackbar } from "notistack";
import io from "socket.io-client";

const getMediaStream = () =>
  navigator.mediaDevices.getUserMedia({
    audio: {
      deviceId: "default",
      sampleRate: 16000,
      sampleSize: 16,
      channelCount: 1,
    },
    video: false,
  });

const TrainBot = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { userToken } = useStateContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const agentId = id;
  const [isMic, setIsMic] = useState(false);
  const [isBot, setisBot] = useState(false);
  const [loader, setLoader] = useState(false);
  const [startChat, setstartChat] = useState(false);

  // const { data, error, isError, isLoading } = useQuery(
  //   `testbot-${agentId}`,
  //   () => fetchAgentDetails('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTI1LCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNzQ3Nzg0MDEyLCJleHAiOjE3NTAzNzYwMTJ9.qBfNEqtXPTkh9WnKeYf-AL_RV6GWlTcX5kJPMIsiTLE', 132),
  //   {
  //     enabled: !!userToken,
  //     staleTime: 0,
  //     cacheTime: 0,
  //   }
  // );

  const {data,error,isError,isLoading} = {
    
data:{
  additionalData:{
    Company_introduction: "Li que Miami",
    Greeting_message: "Hello, welcome to LI QUE Miami, the place of finest dining, how can I assist you today?",
    Restrictions: "Be Polite, courteous, respectful, helpful.",
    Eligibility_criteria: "Everyone is eligible"
  },
  agent_type: "Answer Calls",
  language: "English",
  pineconeIndex: "index1",
  voice_type: "Male"

},
error: null,
isError: false,
isLoading: false,
}
  


  console.log("data", data);
  console.log("error", error);
  console.log("isError", isError);
  console.log("isLoading", isLoading);

  const socketRef = useRef(null);
  const transcriptElementRef = useRef(null);
  const toggleButtonRef = useRef(false);
  const audioQueueRef = useRef([]);
  const isPlayingRef = useRef(false);
  const isConnectedRef = useRef(false);
  const currentAudioRef = useRef(null);

  const streamRef = useRef(null);
  const audioContextRef = useRef();
  const audioInputRef = useRef();
  const processorRef = useRef();

  useEffect(() => {
    const preloadImages = (sources) => {
      sources.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    };

    preloadImages([bot, redMic, redStop]);
  }, []);

  async function timeFunction(text) {
    let currentDate = new Date();
    let hours = currentDate.getHours();
    let minutes = currentDate.getMinutes();
    let seconds = currentDate.getSeconds();
    let milliseconds = currentDate.getMilliseconds();
    let currentTime = `${hours}h ${minutes}m ${seconds}s ${milliseconds}ms`;
    console.log(text + currentTime);
  }

  const startStreaming = async () => {
    if (!data || !data.additionalData) {
      closeSnackbar();
      enqueueSnackbar("Missing required data.", { variant: "error" });
      return;
    }

    setLoader(true);
    try {
      socketRef.current = io(`${import.meta.env.VITE_APP_API_URL}/testbot`);

      socketRef.current.on("connect", () => {
        let newData = data?.additionalData || {};
        newData.pinecone_namespace = "Texas";
        newData.pinecone_index = data?.pineconeIndex;
        // newData.milvus_index = agentId;
        newData.agent_type = data?.agent_type;
        newData.voice_type = data?.voice_type;
        newData.language = data?.language;

        socketRef.current.emit("intial_data", {
          type: "dict",
          additionalData: newData,
        });
        closeSnackbar();
        enqueueSnackbar("Connection Established", { variant: "success" });
        setLoader(false);
        sendEmptyChunks();
        isConnectedRef.current = true;
        setstartChat(true);
        toggleButtonRef.current = true;
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setLoader(false);
        closeSnackbar();
        enqueueSnackbar("Connection Error", { variant: "error" });
        socketRef.current.disconnect();
        stopStreaming();
      });

      socketRef.current.on("disconnect", () => {
        setLoader(false);
        closeSnackbar();
        enqueueSnackbar("Connection Terminated", { variant: "warning" });
        stopStreaming();
      });

      socketRef.current.on("transcript", (transcript) => {
        transcriptElementRef.current.textContent += transcript + "\n";
      });

      socketRef.current.on("audio_chunk", (audioData) => {
        audioQueueRef.current.push(audioData);
        if (!isPlayingRef.current) {
          console.log(Date.now());
          timeFunction("Chat Bot Receive Time: ");
          playNextAudio();
        }
      });
    } catch (err) {
      console.error("Error accessing media devices:", err);
      closeSnackbar();
      enqueueSnackbar("Error accessing media devices", { variant: "error" });
      setLoader(false);
    }
  };

  const sendEmptyChunks = () => {
    console.log(Date.now());
    timeFunction("First Chunk Sending: ");
    socketRef.current.emit("audio_chunk", {
      type: "text",
      data:
        data?.agent_type === "Make Calls"
          ? "Start the conversationn by 'greeting_message' and tell the purpose of calling and ask his interest . Don't ask any other question"
          : "Start the conversation by 'greeting_message' and show intent of assistance.",
    });
  };

  const stopStreaming = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.disconnect();
    }

    stopRecording();
    isConnectedRef.current = false;
    setstartChat(false);
    toggleButtonRef.current = false;
    isPlayingRef.current = false;
    audioQueueRef.current = [];
    setisBot(false);
  };

  const initRecording = async () => {
    if (!streamRef?.current?.active) {
      const stream = await getMediaStream();
      streamRef.current = stream;
      audioContextRef.current = new window.AudioContext();

      await audioContextRef.current.audioWorklet.addModule(
        "/src/worklets/recorderWorkletProcessor.js"
      );

      audioInputRef.current =
        audioContextRef.current.createMediaStreamSource(stream);

      // Use socketRef for sending audio data
      processorRef.current = new AudioWorkletNode(
        audioContextRef.current,
        "recorder.worklet"
      );

      processorRef.current.connect(audioContextRef.current.destination);
      audioInputRef.current.connect(processorRef.current);

      setIsMic(true);
      let voiceSend = true;
      processorRef.current.port.onmessage = (event) => {
        const audioData = event.data;

        // Send audio chunks to the same socketRef
        if (socketRef.current) {
          socketRef.current.emit("audio_chunk", {
            type: "audio",
            data: audioData,
            start: Date.now(),
          });
          if (voiceSend) {
            timeFunction("First Voice Chunk sended: ");
            voiceSend = false;
          }
        }
      };

      socketRef.current.on("audio_converted", (data) => {
        if (data) {
          stopRecording();
        }
      });
    }
  };

  const stopRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    processorRef?.current?.disconnect();
    audioInputRef?.current?.disconnect();
    setIsMic(false);
  };

  const playNextAudio = () => {
    if (audioQueueRef.current.length > 0) {
      stopRecording();
      isPlayingRef.current = true;
      const audioBlob = new Blob([audioQueueRef.current.shift()], {
        type: "audio/wav",
      });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;
      audio.addEventListener("ended", () => {
        isPlayingRef.current = false;
        playNextAudio();
      });
      setisBot(true);
      audio.play();
    } else {
      setisBot(false);
      initRecording();
    }
  };

  const handleToggleButtonClick = async () => {
    if (isConnectedRef.current) {
      stopStreaming();
    } else {
      await startStreaming();
    }
  };

  useEffect(() => {
    const cleanup = () => {
      stopStreaming();
    };
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isError) {
      closeSnackbar();
      enqueueSnackbar(error?.response.data.error, {
        variant: "error",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, isError]);

  return (
    <Box
      sx={{
        height: {
          xs: "85vh",
          sm: "84vh",
        },
      }}
    >
      <PageLoading loading={loader} text="Connecting..." />
      <PageLoading loading={isLoading} />
      <Box
        sx={{
          position: "sticky",
          top: 0,

          overflowY: "hidden",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fff",
          border: "1px solid #d9d9d9",
          borderRadius: "10px",

          height: {
            xs: "85vh",
            sm: "80vh",
          },
        }}
      >
        <Box
          onClick={() => {
            navigate(-1);
          }}
          sx={{
            display: "flex",
            gap: "10px",
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "6px",
            width: "fit-content",
            alignItems: "center",
            cursor: "pointer",
            px: 2,
            py: 1,
            mb: 2,
            position: "absolute",
            top: "1rem",
            left: "1.5rem",
            zIndex: 1,
            "&:hover": {
              backgroundColor: "#f9f9fb",
            },
          }}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back
        </Box>
        <Box
          sx={{
            height: "70%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            className={`mic ${isBot && "talking"}`}
            style={{
              width: "35px",
              height: "35px",
              zIndex: 1,
            }}
          >
            <img
              src={bot}
              alt="bot"
              style={{
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          </button>
        </Box>

        <Box
          sx={{
            height: "30%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            onClick={handleToggleButtonClick}
            className={`mic ${isMic && "listening"}`}
            style={{
              height: "70px",
              width: "70px",
            }}
          >
            <img
              src={startChat ? redStop : redMic}
              alt="bot"
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                objectFit: "cover",
                cursor: "pointer",
              }}
            />
          </button>
        </Box>
      </Box>
    </Box>
  );
};

export default TrainBot;
