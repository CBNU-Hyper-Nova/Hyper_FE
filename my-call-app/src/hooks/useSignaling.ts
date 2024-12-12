import { useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import { useAuthStore } from "../store/authStore";
import { useCallStore } from "../store/callStore";
import { useNavigate } from "react-router-dom";

interface SignalingProps {
	onCallRequest?: (data: any) => void;
	onCallAccept?: (data: any) => void;
	onCallReject?: (data: any) => void;
}

export const useSignaling = (mySignalingId: string, callbacks: SignalingProps = {}) => {
	const client = useRef<Client | null>(null);
	const isConnecting = useRef<boolean>(false);
	const { setIsReceiving, setCallerInfo, setIsPending, setIsInCall, setIsCalling, setLocalStream } =
		useCallStore();
	const navigate = useNavigate();

	const handleMessage = useCallback(
		async (data: any) => {
			console.log("메시지 수신 raw data:", data);

			if (!data || !data.type) {
				console.error("잘못된 메시지 형식:", data);
				return;
			}

			switch (data.type) {
				case "call-request":
					console.log("통화 요청 수신됨:", data);
					setIsReceiving(true);
					setCallerInfo({
						id: data.from,
						type: data.payload.type,
					});
					break;
				case "call-accept":
					console.log("통화 수락됨:", data);
					setIsPending(false);
					setIsInCall(true);
					setIsCalling(false);

					try {
						const stream = await navigator.mediaDevices.getUserMedia({
							video: true,
							audio: true,
						});
						setLocalStream(stream);
						navigate("/video-call");
					} catch (error) {
						console.error("미디어 스트림 오류:", error);
						alert("카메라와 마이크 권한이 필요합니다.");
					}
					break;
				case "call-reject":
					console.log("통화 거절됨:", data);
					// 전화 건 사람이 받는 경우
					setIsPending(false);
					setIsCalling(false);
					setIsInCall(false);
					navigate("/friends");
					break;
				default:
					console.log("처리되지 않은 메시지 타입:", data.type);
			}
		},
		[setIsReceiving, setIsPending, setIsInCall, setIsCalling, setCallerInfo, navigate]
	);

	const createStompClient = useCallback(
		(myId: string) => {
			if (!myId || isConnecting.current) return null;

			const stompClient = new Client({
				brokerURL: "ws://localhost:8678/ws",
				connectHeaders: {
					login: myId,
				},
				debug: function (str) {
					console.log("STOMP:", str);
				},
				reconnectDelay: 5000,
				heartbeatIncoming: 4000,
				heartbeatOutgoing: 4000,
			});

			stompClient.onConnect = () => {
				console.log("STOMP 연결 성공. ID:", myId);
				isConnecting.current = false;

				stompClient.subscribe(
					`/user/${myId}/queue/messages`,
					(message) => {
						try {
							console.log("원본 STOMP 메시지:", message);
							const data = JSON.parse(message.body);
							console.log("파싱된 메시지 데이터:", data);
							handleMessage(data);
						} catch (error) {
							console.error("메시지 처리 오류:", error);
						}
					},
					{
						id: "sub-0",
					}
				);

				console.log("구독 완료:", `/user/${myId}/queue/messages`);
			};

			stompClient.onStompError = (frame) => {
				console.error("STOMP 에러:", frame);
			};

			return stompClient;
		},
		[handleMessage]
	);

	const signalSend = useCallback(
		(type: string, payload: any) => {
			console.log("signalSend 호출됨:", type, payload);

			if (type === "call-request") {
				setIsPending(true);
			}

			if (!client.current?.connected) {
				console.error("STOMP 클라이언트가 연결되지 않음");
				return;
			}

			try {
				const message = {
					type,
					from: mySignalingId,
					to: payload.to,
					payload,
				};

				console.log("전송할 메시지:", message);

				client.current.publish({
					destination: `/app/message`,
					headers: {
						"content-type": "application/json",
					},
					body: JSON.stringify(message),
				});

				console.log("메시지 전송 완료");
			} catch (error) {
				console.error("메시지 전송 오류:", error);
				if (type === "call-request") {
					setIsPending(false);
				}
			}
		},
		[mySignalingId, setIsPending]
	);

	useEffect(() => {
		if (!mySignalingId) return;

		if (client.current) {
			client.current.deactivate();
			client.current = null;
		}

		const newClient = createStompClient(mySignalingId);
		if (newClient) {
			client.current = newClient;
			client.current.activate();
		}

		return () => {
			if (client.current) {
				client.current.deactivate();
				client.current = null;
			}
			isConnecting.current = false;
		};
	}, [mySignalingId, createStompClient]);

	return { sendMessage: signalSend };
};
async function handleReceivedOffer(offer: RTCSessionDescriptionInit, from: string, ws: WebSocket) {
	console.log("Received offer:", offer);
}

async function handleReceivedAnswer(answer: RTCSessionDescriptionInit) {
	console.log("Received answer:", answer);
}

async function handleReceivedCandidate(candidate: RTCIceCandidateInit) {
	console.log("Received ICE candidate:", candidate);
}

export default useSignaling;
