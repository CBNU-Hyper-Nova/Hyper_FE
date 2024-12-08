import { useEffect } from "react";
import { useCallStore } from "../store/callStore";

const SIGNALING_SERVER_URL = "ws://localhost:8081/ws"; // Spring Boot 백엔드 WebSocket 엔드포인트

export const useSignaling = () => {
	const {
		signalingId,
		setSignalingId,
		setPeerConnection,
		peerConnection,
		setRemoteStream,
		endCall,
		receiveCall,
	} = useCallStore();

	useEffect(() => {
		// WebSocket 연결 생성
		const ws = new WebSocket(SIGNALING_SERVER_URL);

		ws.onopen = () => {
			console.log("시그널링 서버에 연결됨");
			// 필요 시 인증 토큰 전송
			// ws.send(JSON.stringify({ type: "authenticate", token: "YOUR_AUTH_TOKEN" }));
		};

		ws.onmessage = async (message) => {
			try {
				const data = JSON.parse(message.data);
				const { type, payload, from } = data;

				console.log("수신된 메시지:", data);

				switch (type) {
					case "id":
						setSignalingId(payload.id);
						break;
					case "offer":
						await handleReceiveOffer(payload, from, ws);
						break;
					case "answer":
						await handleReceiveAnswer(payload);
						break;
					case "ice-candidate":
						await handleReceiveICE(payload);
						break;
					case "call-reject":
						alert("상대방이 통화를 거절했습니다.");
						endCall();
						break;
					default:
						console.warn("알 수 없는 메시지 타입:", type);
				}
			} catch (error) {
				console.error("메시지 처리 중 오류:", error);
			}
		};

		ws.onclose = () => {
			console.log("시그널링 서버 연결 해제됨");
			endCall();
		};

		const handleReceiveOffer = async (offer: any, from: string, ws: WebSocket) => {
			const pc = createPeerConnection(ws, from);
			setPeerConnection(pc);

			try {
				await pc.setRemoteDescription(new RTCSessionDescription(offer));
				const answer = await pc.createAnswer();
				await pc.setLocalDescription(answer);

				// Answer 전송
				ws.send(
					JSON.stringify({
						type: "answer",
						payload: answer,
						to: from,
						from: signalingId,
					})
				);
			} catch (error) {
				console.error("Offer 처리 중 오류:", error);
			}
		};

		const handleReceiveAnswer = async (answer: any) => {
			try {
				if (peerConnection) {
					await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
				}
			} catch (error) {
				console.error("Answer 처리 중 오류:", error);
			}
		};

		const handleReceiveICE = async (candidate: any) => {
			try {
				if (peerConnection) {
					await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
				}
			} catch (error) {
				console.error("ICE 후보 추가 중 오류:", error);
			}
		};

		const createPeerConnection = (ws: WebSocket, targetId: string): RTCPeerConnection => {
			const configuration: RTCConfiguration = {
				iceServers: [
					{ urls: "stun:stun.l.google.com:19302" },
					// 필요 시 TURN 서버 추가
				],
			};

			const pc = new RTCPeerConnection(configuration);

			pc.onicecandidate = (event) => {
				if (event.candidate) {
					ws.send(
						JSON.stringify({
							type: "ice-candidate",
							payload: event.candidate,
							to: targetId,
							from: signalingId,
						})
					);
				}
			};

			pc.ontrack = (event) => {
				const remoteStream = new MediaStream();
				remoteStream.addTrack(event.track);
				setRemoteStream(remoteStream);
			};

			return pc;
		};

		return () => {
			ws.close();
		};
	}, [signalingId, setSignalingId, setPeerConnection, peerConnection, setRemoteStream, endCall]);

	// Offer 생성 및 전송 함수
	const initiateCall = async (type: "audio" | "video") => {
		if (!signalingId) {
			alert("시그널링 서버에 연결되지 않았습니다.");
			return;
		}

		const { selectedFriend } = useCallStore.getState();

		if (!selectedFriend || !selectedFriend.signalingId) {
			alert("통화를 시작할 친구를 선택해주세요.");
			return;
		}

		const constraints: MediaStreamConstraints = {
			video: type === "video",
			audio: true,
		};

		try {
			const stream = await navigator.mediaDevices.getUserMedia(constraints);
			useCallStore.getState().setLocalStream(stream);

			const pc = createPeerConnection(ws, selectedFriend.signalingId);
			setPeerConnection(pc);

			// 로컬 스트림의 트랙을 PeerConnection에 추가
			stream.getTracks().forEach((track) => {
				pc.addTrack(track, stream);
			});

			// Offer 생성
			const offer = await pc.createOffer();
			await pc.setLocalDescription(offer);

			// Offer 전송
			ws.send(
				JSON.stringify({
					type: "offer",
					payload: offer,
					to: selectedFriend.signalingId,
					from: signalingId,
				})
			);

			useCallStore.getState().setIsCalling(true);
		} catch (error) {
			console.error("통화 시작 중 오류:", error);
		}
	};

	return { initiateCall };
};
