// src/utils/webSocketClient.ts
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const socketUrl = "http://localhost:8080/ws"; // WebSocket URL

const sock = new SockJS(socketUrl);
const stompClient = new Client({
	webSocketFactory: () => sock as any,
	onConnect: () => {
		console.log("Connected to WebSocket");
	},
	onDisconnect: () => {
		console.log("Disconnected from WebSocket");
	},
});

export default stompClient;
