import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function Cube({ shouldAnimate }) {
  const ref = useRef();
  useEffect(() => {
    if (!ref.current) return;
    if (shouldAnimate) {
      let frame = 0;
      const animate = () => {
        if (frame < 60) {
          ref.current.rotation.y += 0.1;
          ref.current.rotation.x += 0.05;
          frame++;
          requestAnimationFrame(animate);
        }
      };
      animate();
    }
  }, [shouldAnimate]);

  return (
    <mesh ref={ref}>
      <boxGeometry />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [animateCube, setAnimateCube] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("https://abcd1234.ngrok.io", {
      transports: ["websocket"],  // Force WebSocket to avoid polling issues
      forceNew: true,                // Avoid reusing connections
    });
    

    // Listen for chat messages
    newSocket.on("chat message", (msg) => {
      setMessages((prev) => [...prev, msg]);
      setAnimateCube(true);
      setTimeout(() => setAnimateCube(false), 1000);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.off("chat message");
      newSocket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim() || !socket) return;
    socket.emit("chat message", input);
    setInput("");
  };

  return (
    <div className="h-screen w-full flex flex-col items-center bg-gray-100 p-4">
      <Canvas className="w-full h-1/3">
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Cube shouldAnimate={animateCube} />
        <OrbitControls />
      </Canvas>
      <div className="w-full max-w-md bg-white rounded shadow p-4 flex-1 flex flex-col">
        <div className="flex-1 overflow-auto space-y-2">
          {messages.map((msg, idx) => (
            <div key={idx} className="p-2 bg-gray-200 rounded">
              {msg}
            </div>
          ))}
        </div>
        <div className="flex mt-4">
          <input
            className="flex-1 border rounded p-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
