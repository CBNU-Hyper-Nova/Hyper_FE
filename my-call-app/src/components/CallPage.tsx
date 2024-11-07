// src/components/CallPage.tsx
import React, { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useCallStore } from "../stores/useCallStore";
import profileImage from "../assets/profile.png";
import { FiPhoneCall, FiUser, FiSettings } from "react-icons/fi";

const users = [
	{ id: 1, name: "SangJun", profileImage: profileImage },
	{ id: 2, name: "GaEun", profileImage: profileImage },
	{ id: 3, name: "YuGyeong", profileImage: profileImage },
];

const CallPage: React.FC = () => {
	const { callStatus, initiateCall, receiveCall, acceptCall, rejectCall, endCall, selectedUser } =
		useCallStore();

	const localStreamRef = useRef<MediaStream | null>(null);
	const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
	const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

	const iceServers = {
		iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
	};

	// 음성 권한 요청 및 통화 시작
	const handleInitiateCall = async (user) => {
		try {
			// 오디오 권한 요청
			const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
			localStreamRef.current = localStream;

			initiateCall(user);
			setTimeout(() => receiveCall(), 1000); // 1초 뒤 상대방에게 ringing 상태로 전환

			// PeerConnection 설정
			const peerConnection = new RTCPeerConnection(iceServers);
			peerConnectionRef.current = peerConnection;

			// 로컬 오디오 트랙을 PeerConnection에 추가
			localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

			// 원격 스트림 설정
			peerConnection.ontrack = (event) => {
				if (remoteAudioRef.current) {
					remoteAudioRef.current.srcObject = event.streams[0];
				}
			};

			// ICE Candidate 수신 후 전송
			peerConnection.onicecandidate = (event) => {
				if (event.candidate) {
					// Signaling 서버에 ICE Candidate 전송 (예: socket.emit)
					console.log("Send ICE Candidate", event.candidate);
				}
			};

			// Offer 생성 및 설정
			const offer = await peerConnection.createOffer();
			await peerConnection.setLocalDescription(offer);

			// Offer 전송 (예: socket.emit)
			console.log("Send Offer", offer);
		} catch (error) {
			console.error("Error accessing audio devices:", error);
			alert(
				"Audio permission is required to make a call. Please enable it in your browser settings."
			);
		}
	};

	// 통화 종료
	const handleEndCall = () => {
		endCall();
		peerConnectionRef.current?.close();
		peerConnectionRef.current = null;
		if (localStreamRef.current) {
			localStreamRef.current.getTracks().forEach((track) => track.stop());
		}
	};

	return (
		<Wrapper>
			<Navbar>
				<NavLogo>MyApp</NavLogo>
				<NavItems>
					<NavItem>
						<FiUser size={24} />
					</NavItem>
					<NavItem>
						<FiPhoneCall size={24} />
					</NavItem>
					<NavItem>
						<FiSettings size={24} />
					</NavItem>
				</NavItems>
			</Navbar>

			{callStatus === "idle" && (
				<IdleContainer>
					<IdleText>Select a user to start a call</IdleText>
					<UserList>
						{users.map((user) => (
							<UserCard key={user.id}>
								<ProfileImage src={user.profileImage} alt={`${user.name}'s profile`} />
								<UserName>{user.name}</UserName>
								<ActionButton onClick={() => handleInitiateCall(user)}>Call</ActionButton>
							</UserCard>
						))}
					</UserList>
				</IdleContainer>
			)}

			{callStatus === "calling" && (
				<StatusContainer>
					<StatusText>Calling {selectedUser?.name}...</StatusText>
					<Loader />
				</StatusContainer>
			)}

			{callStatus === "ringing" && (
				<CallContainer>
					<ProfileImageLarge
						src={selectedUser?.profileImage}
						alt={`${selectedUser?.name}'s profile`}
					/>
					<CallText>{selectedUser?.name} is calling...</CallText>
					<ButtonContainer>
						<AcceptButton onClick={acceptCall}>Accept</AcceptButton>
						<RejectButton onClick={rejectCall}>Reject</RejectButton>
					</ButtonContainer>
				</CallContainer>
			)}

			{callStatus === "accepted" && (
				<OnCallContainer>
					<ProfileImageLarge
						src={selectedUser?.profileImage}
						alt={`${selectedUser?.name}'s profile`}
					/>
					<ProfileName>{selectedUser?.name}</ProfileName>
					<EndCallButton onClick={handleEndCall}>End Call</EndCallButton>
					<audio ref={remoteAudioRef} autoPlay />
				</OnCallContainer>
			)}

			{callStatus === "rejected" && (
				<StatusContainer>
					<RejectedText>Call Rejected</RejectedText>
				</StatusContainer>
			)}
		</Wrapper>
	);
};

export default CallPage;

// Styled Components
const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	height: 100vh;
	font-family: "Montserrat", sans-serif;
	background: linear-gradient(to bottom right, #6a11cb, #2575fc);
`;

const Navbar = styled.nav`
	display: flex;
	justify-content: space-between;
	align-items: center;
	background-color: rgba(255, 255, 255, 0.15);
	padding: 10px 20px;
	backdrop-filter: blur(10px);
`;

const NavLogo = styled.div`
	font-size: 24px;
	color: #fff;
	font-weight: bold;
`;

const NavItems = styled.div`
	display: flex;
	gap: 20px;
`;

const NavItem = styled.div`
	color: #fff;
	cursor: pointer;
	transition: color 0.3s;
	&:hover {
		color: #ffeb3b;
	}
`;

const IdleContainer = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`;

const IdleText = styled.h2`
	font-size: 32px;
	color: #fff;
	margin-bottom: 40px;
	text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const UserList = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 30px;
	justify-content: center;
`;

const UserCard = styled.div`
	background-color: rgba(255, 255, 255, 0.15);
	border-radius: 16px;
	padding: 30px;
	width: 200px;
	text-align: center;
	backdrop-filter: blur(10px);
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
	transition: transform 0.3s;
	&:hover {
		transform: translateY(-10px);
	}
`;

const ProfileImage = styled.img`
	width: 80px;
	height: 80px;
	border-radius: 50%;
`;

const UserName = styled.h3`
	font-size: 24px;
	color: #fff;
	margin: 20px 0;
`;

const ActionButton = styled.button`
	background-color: #ff5722;
	color: white;
	padding: 12px 24px;
	font-size: 18px;
	border: none;
	border-radius: 30px;
	cursor: pointer;
	transition: background-color 0.3s, transform 0.2s;
	&:hover {
		background-color: #e64a19;
		transform: translateY(-2px);
	}
`;

const StatusContainer = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`;

const StatusText = styled.div`
	font-size: 36px;
	color: #fff;
	margin-bottom: 30px;
	text-align: center;
	text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const Loader = styled.div`
	border: 10px solid rgba(255, 255, 255, 0.3);
	border-top: 10px solid #fff;
	border-radius: 50%;
	width: 80px;
	height: 80px;
	animation: ${keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  `} 1s linear infinite;
`;

const CallContainer = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`;

const ProfileImageLarge = styled(ProfileImage)`
	width: 150px;
	height: 150px;
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
`;

const CallText = styled.h2`
	font-size: 32px;
	color: #fff;
	margin: 30px 0;
	text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const ButtonContainer = styled.div`
	display: flex;
	gap: 40px;
`;

const AcceptButton = styled(ActionButton)`
	background-color: #4caf50;
	&:hover {
		background-color: #43a047;
	}
`;

const RejectButton = styled(ActionButton)`
	background-color: #f44336;
	&:hover {
		background-color: #e53935;
	}
`;

const OnCallContainer = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`;

const ProfileName = styled.h2`
	font-size: 36px;
	color: #fff;
	margin: 30px 0;
	text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const EndCallButton = styled(ActionButton)`
	background-color: #f44336;
	&:hover {
		background-color: #e53935;
	}
`;

const RejectedText = styled.div`
	font-size: 36px;
	color: #f44336;
	text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

// // src/components/CallPage.tsx
// import React, { useEffect, useRef, useState } from "react";
// import styled from "styled-components";
// import { useCallStore } from "../stores/useCallStore";
// import profileImage from "../assets/profile.png";
// import stompClient from "../utils/webSocketClient"; // WebSocket 클라이언트 추가

// const users = [
// 	{ id: 1, name: "SangJun", profileImage: profileImage },
// 	{ id: 2, name: "GaEun", profileImage: profileImage },
// 	{ id: 3, name: "YuGyeong", profileImage: profileImage },
// ];

// const CallPage: React.FC = () => {
// 	const { callStatus, initiateCall, receiveCall, acceptCall, rejectCall, endCall, selectedUser } =
// 		useCallStore();

// 	const localStreamRef = useRef<MediaStream | null>(null);
// 	const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
// 	const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

// 	const iceServers = {
// 		iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
// 	};

// 	// WebSocket 초기화 및 구독
// 	useEffect(() => {
// 		stompClient.activate();

// 		stompClient.subscribe("/queue/{userId}/call", (message) => {
// 			console.log("Received Call Request:", message.body);
// 			// 수신자에게 통화 요청 로직 추가
// 			receiveCall();
// 		});

// 		stompClient.subscribe("/queue/{userId}/accept", (message) => {
// 			console.log("Call Accepted:", message.body);
// 			// 통화 수락 로직 추가
// 			handlePeerConnection();
// 		});

// 		stompClient.subscribe("/queue/{userId}/reject", (message) => {
// 			console.log("Call Rejected:", message.body);
// 			// 통화 거절 로직 추가
// 			endCall();
// 		});

// 		stompClient.subscribe("/topic/end", (message) => {
// 			console.log("Call Ended:", message.body);
// 			// 통화 종료 로직 추가
// 			handleEndCall();
// 		});

// 		return () => {
// 			stompClient.deactivate();
// 		};
// 	}, []);

// 	// 음성 권한 요청 및 통화 시작
// 	const handleInitiateCall = async (user) => {
// 		try {
// 			// 오디오 권한 요청
// 			const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
// 			localStreamRef.current = localStream;

// 			initiateCall(user);
// 			stompClient.publish({
// 				destination: "/app/call",
// 				body: JSON.stringify({ caller: "currentUserId", receiver: user.id }),
// 			});

// 			// PeerConnection 설정
// 			handlePeerConnection();
// 		} catch (error) {
// 			console.error("Error accessing audio devices:", error);
// 			alert(
// 				"Audio permission is required to make a call. Please enable it in your browser settings."
// 			);
// 		}
// 	};

// 	// PeerConnection 설정
// 	const handlePeerConnection = () => {
// 		const peerConnection = new RTCPeerConnection(iceServers);
// 		peerConnectionRef.current = peerConnection;

// 		// 로컬 오디오 트랙을 PeerConnection에 추가
// 		if (localStreamRef.current) {
// 			localStreamRef.current
// 				.getTracks()
// 				.forEach((track) => peerConnection.addTrack(track, localStreamRef.current!));
// 		}

// 		// 원격 스트림 설정
// 		peerConnection.ontrack = (event) => {
// 			if (remoteAudioRef.current) {
// 				remoteAudioRef.current.srcObject = event.streams[0];
// 			}
// 		};

// 		// ICE Candidate 수신 후 전송
// 		peerConnection.onicecandidate = (event) => {
// 			if (event.candidate) {
// 				stompClient.publish({
// 					destination: "/app/candidate",
// 					body: JSON.stringify({ candidate: event.candidate }),
// 				});
// 			}
// 		};
// 	};

// 	// 통화 종료
// 	const handleEndCall = () => {
// 		endCall();
// 		peerConnectionRef.current?.close();
// 		peerConnectionRef.current = null;
// 		if (localStreamRef.current) {
// 			localStreamRef.current.getTracks().forEach((track) => track.stop());
// 		}
// 		stompClient.publish({
// 			destination: "/app/end",
// 			body: JSON.stringify({ user: "currentUserId" }),
// 		});
// 	};

// 	return (
// 		<Wrapper>
// 			{callStatus === "idle" && (
// 				<IdleContainer>
// 					<IdleText>Select a user to start a call:</IdleText>
// 					{users.map((user) => (
// 						<UserContainer key={user.id}>
// 							<ProfileImage src={user.profileImage} alt={`${user.name}'s profile`} />
// 							<UserName>{user.name}</UserName>
// 							<ActionButton onClick={() => handleInitiateCall(user)}>Call</ActionButton>
// 						</UserContainer>
// 					))}
// 				</IdleContainer>
// 			)}

// 			{callStatus === "calling" && <CallingText>Calling {selectedUser?.name}...</CallingText>}

// 			{callStatus === "ringing" && (
// 				<CallContainer>
// 					<CallText>{selectedUser?.name} is calling...</CallText>
// 					<ButtonContainer>
// 						<AcceptButton onClick={acceptCall}>Accept</AcceptButton>
// 						<RejectButton onClick={rejectCall}>Reject</RejectButton>
// 					</ButtonContainer>
// 				</CallContainer>
// 			)}

// 			{callStatus === "accepted" && (
// 				<OnCallContainer>
// 					<ProfileImage src={selectedUser?.profileImage} alt={`${selectedUser?.name}'s profile`} />
// 					<ProfileName>{selectedUser?.name}</ProfileName>
// 					<EndCallButton onClick={handleEndCall}>End Call</EndCallButton>
// 					<audio ref={remoteAudioRef} autoPlay />
// 				</OnCallContainer>
// 			)}

// 			{callStatus === "rejected" && <RejectedText>Call Rejected</RejectedText>}
// 		</Wrapper>
// 	);
// };

// export default CallPage;

// // Styled Components (이전과 동일)

// const Wrapper = styled.div`
// 	display: flex;
// 	flex-direction: column;
// 	align-items: center;
// 	justify-content: center;
// 	height: 100vh;
// 	background-color: #f0f4f8;
// 	font-family: Arial, sans-serif;
// `;

// const IdleContainer = styled.div`
// 	display: flex;
// 	flex-direction: column;
// 	align-items: flex-start;
// 	width: 80%;
// 	height: 75%;
// 	padding: 20px;
// 	background-color: #ffffff;
// 	border-radius: 8px;
// 	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
// `;

// const IdleText = styled.h2`
// 	font-size: 20px;
// 	color: #333;
// 	margin-bottom: 15px;
// `;

// const UserContainer = styled.div`
// 	display: flex;
// 	align-items: center;
// 	justify-content: space-between;
// 	width: 100%;
// 	height: 20%;
// 	padding: 10px 0;
// 	border-bottom: 1px solid #e0e0e0;
// `;

// const UserName = styled.h3`
// 	font-size: 32px;
// 	color: #333;
// 	margin: 0;
// `;

// const ButtonContainer = styled.div`
// 	display: flex;
// 	gap: 10px;
// `;

// const ActionButton = styled.button`
// 	background-color: #007bff;
// 	color: white;
// 	padding: 8px 16px;
// 	font-size: 32px;
// 	border: none;
// 	border-radius: 4px;
// 	cursor: pointer;
// 	transition: background-color 0.3s;
// 	&:hover {
// 		background-color: #0056b3;
// 	}
// `;

// const CallingText = styled.div`
// 	font-size: 32px;
// 	color: #007bff;
// `;

// const CallContainer = styled.div`
// 	display: flex;
// 	flex-direction: column;
// 	align-items: center;
// 	background-color: #fff;
// 	padding: 20px;
// 	padding-top: 110px;
// 	border-radius: 8px;
// 	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
// 	width: 30%;
// 	height: 30%;
// `;

// const CallText = styled.h2`
// 	font-size: 32px;
// 	color: #333;
// 	margin-bottom: 20px;
// `;

// const AcceptButton = styled(ActionButton)`
// 	background-color: #4caf50;
// 	&:hover {
// 		background-color: #45a049;
// 	}
// `;

// const RejectButton = styled(ActionButton)`
// 	background-color: #f44336;
// 	&:hover {
// 		background-color: #e53935;
// 	}
// `;

// const OnCallContainer = styled.div`
// 	display: flex;
// 	flex-direction: column;
// 	align-items: center;
// `;

// const ProfileImage = styled.img`
// 	width: 80px;
// 	height: 80px;
// 	border-radius: 50%;
// 	margin-right: 10px;
// `;

// const ProfileName = styled.h2`
// 	font-size: 32px;
// 	color: #333;
// 	margin-bottom: 20px;
// `;

// const EndCallButton = styled(ActionButton)`
// 	background-color: #f44336;
// 	&:hover {
// 		background-color: #e53935;
// 	}
// `;

// const RejectedText = styled.div`
// 	font-size: 32px;
// 	color: #f44336;
// `;
