// src/components/FriendsList.tsx
import React, { useEffect, useCallback } from "react";
import { useCallStore } from "../store/callStore";
import styled from "styled-components";
import { theme } from "../theme";
import BaseButton from "./common/BaseButton";
import Container from "./common/Container";
import Card from "./common/Card";
import { useSignaling } from "../hooks/useSignaling";
import { useAuthStore } from "../store/authStore";

const ProfileImage = styled.img`
	width: 50px;
	height: 50px;
	border-radius: 50%;
	object-fit: cover;
	margin-right: ${theme.spacing.md};

	@media (max-width: ${theme.breakpoints.mobile}) {
		width: 40px;
		height: 40px;
		margin-right: ${theme.spacing.sm};
	}
`;

const FriendName = styled.span`
	font-size: 18px;
	font-family: ${theme.fonts.secondary};
	color: ${theme.colors.text};
	font-weight: 600;

	@media (max-width: ${theme.breakpoints.mobile}) {
		font-size: 16px;
	}
`;

const ButtonsSection = styled.div`
	display: flex;
	gap: ${theme.spacing.sm};

	@media (max-width: ${theme.breakpoints.mobile}) {
		margin-top: ${theme.spacing.sm};
		width: 100%;
		justify-content: space-between;
	}
`;

const FriendContainer = styled.div`
	padding: 1rem;
	width: 60vw;
	height: 70vh;
	border-radius: 8px;
	background: white;
`;

const FriendItem = styled.div`
	display: flex;
	align-items: center;
	padding: 0.5rem;
	margin-bottom: 0.5rem;
	border-radius: 8px;
	background: white;
`;

const Button = styled.button<{ variant?: "primary" | "secondary" }>`
	padding: 0.5rem 1rem;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	background: ${(props) => (props.variant === "primary" ? "#4CAF50" : "#2196F3")};
	color: white;
`;

const FriendsList: React.FC = () => {
	const { user } = useAuthStore();
	const { friends, selectFriend, startCall, isCalling, isInCall, setPeerConnection, setIsPending } =
		useCallStore();
	const { sendMessage } = useSignaling(user?.signalingId || "", {
		onCallAccept: (data) => {
			console.log("통화 수락됨:", data);
			// 여기서 통화 화면으로 전환
		},
		onCallReject: (data) => {
			console.log("통화 거절됨:", data);
			setIsPending(false);
		},
	});

	useEffect(() => {
		console.log("현재 로그인된 사용자:", user);
		console.log("현재 친구 목록:", friends);
	}, [user, friends]);

	// 로그인된 사용자에 따라 친구 목록 필터링
	const filteredFriends = friends.filter((friend) => {
		if (user?.signalingId === "박상준") {
			return friend.name === "박유경";
		} else if (user?.signalingId === "박유경") {
			return friend.name === "박상준";
		}
		// 추가적인 사용자에 대한 조건을 여기에 추가할 수 있습니다.
		return false;
	});

	const handleVideoCall = async (friend: Friend) => {
		if (!user?.signalingId) {
			console.error("로그인이 필요합니다");
			return;
		}

		try {
			console.log("통화 시도:", friend);

			// 상태 업데이트
			selectFriend(friend);
			setIsPending(true);

			// 시그널링 메시지 전송
			sendMessage("call-request", {
				from: user.signalingId,
				to: friend.signalingId,
				type: "video",
			});

			console.log("통화 요청 전송 완료");
		} catch (error) {
			console.error("통화 요청 실패:", error);
			setIsPending(false);
		}
	};

	const initiateCall = async (type: "audio" | "video") => {
		const { selectedFriend } = useCallStore.getState();

		if (!user?.signalingId || !selectedFriend?.signalingId) {
			console.error("필요한 정보가 없습니다:", { user, selectedFriend });
			alert("통화를 시작할 수 없습니다. 필요한 정보가 없습니다.");
			return;
		}

		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: type === "video",
				audio: true,
			});

			setLocalStream(stream);
			startCall(type);

			sendMessage("call-request", {
				from: user.signalingId,
				to: selectedFriend.signalingId,
				type: type,
			});
		} catch (error) {
			console.error("통화 시작 실패:", error);
			alert("통화를 시작할 수 없습니다.");
			setIsPending(false);
		}
	};

	const handleAudioCall = (friend: Friend) => {
		if (isCalling || isInCall) {
			alert("현재 다른 통화가 진행 중입니다.");
			return;
		}
		selectFriend(friend);
		initiateCall("audio");
	};

	const handleCallRequest = useCallback(
		(data: CallRequestData) => {
			console.log("통화 요청 수신:", data);
			setIsPending(true);
		},
		[setIsPending]
	);

	const { sendMessage: signalSend } = useSignaling(user?.signalingId, {
		onCallRequest: handleCallRequest,
	});

	return (
		<FriendContainer>
			<h2>친구 목록</h2>
			{filteredFriends.length === 0 ? (
				<p>친구를 추가해보세요!</p>
			) : (
				filteredFriends.map((friend) => (
					<Card key={friend.id}>
						<div style={{ display: "flex", alignItems: "center" }}>
							<ProfileImage src={`/profiles/park.jpg`} alt={friend.name} />
							<FriendName>{friend.name}</FriendName>
						</div>
						<ButtonsSection>
							<BaseButton
								variant='primary'
								onClick={() => handleVideoCall(friend)}
								disabled={isCalling || isInCall}
							>
								<i className='fas fa-video' /> Call
							</BaseButton>
						</ButtonsSection>
					</Card>
				))
			)}
		</FriendContainer>
	);
};

export default FriendsList;
