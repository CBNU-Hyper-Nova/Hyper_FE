// src/components/FriendsList.tsx
import React from "react";
import { useCallStore } from "../store/callStore";
import styled from "styled-components";
import { theme } from "../theme";
import BaseButton from "./common/BaseButton";
import Container from "./common/Container";
import Card from "./common/Card";

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

const FriendsList: React.FC = () => {
	const { friends, selectFriend, startCall, isCalling, isInCall, signalingId, peerConnection } =
		useCallStore();

	const initiateCall = async (type: "audio" | "video") => {
		const { selectedFriend, signaling, setPeerConnection, setRemoteStream, setLocalStream } =
			useCallStore.getState();

		if (!selectedFriend || !signalingId || !signaling) {
			alert("통화를 시작할 친구를 선택하거나 시그널링 서버에 연결되지 않았습니다.");
			return;
		}

		// 새로운 PeerConnection 생성
		const configuration: RTCConfiguration = {
			iceServers: [
				{ urls: "stun:stun.l.google.com:19302" },
				// 필요 시 TURN 서버 추가
			],
		};

		const pc = new RTCPeerConnection(configuration);
		setPeerConnection(pc);

		// ICE 후보 발생 시 시그널링 서버로 전송
		pc.onicecandidate = (event) => {
			if (event.candidate) {
				signaling.send(
					JSON.stringify({
						type: "ice-candidate",
						payload: event.candidate,
						to: selectedFriend.signalingId,
					})
				);
			}
		};

		// 원격 스트림 수신 시 처리
		pc.ontrack = (event) => {
			const remoteStream = new MediaStream();
			remoteStream.addTrack(event.track);
			setRemoteStream(remoteStream);
		};

		// 로컬 스트림 가져오기
		try {
			const constraints: MediaStreamConstraints = {
				video: type === "video" ? { width: 640, height: 480 } : false,
				audio: true,
			};
			const stream = await navigator.mediaDevices.getUserMedia(constraints);
			setLocalStream(stream);
			if (type === "video") {
				// 자신의 비디오를 VideoCall 컴포넌트에서 설정하므로 별도 설정 생략
			}
			// PeerConnection에 로컬 스트림 추가
			stream.getTracks().forEach((track) => {
				pc.addTrack(track, stream);
			});

			// Offer 생성 및 전송
			const offer = await pc.createOffer();
			await pc.setLocalDescription(offer);

			signaling.send(
				JSON.stringify({
					type: "offer",
					payload: offer,
					to: selectedFriend.signalingId,
				})
			);

			// 상태 업데이트
			startCall(type);
		} catch (error) {
			console.error("미디어 스트림 가져오기 오류:", error);
			alert("미디어 스트림을 가져오는 데 실패했습니다.");
		}
	};

	const handleAudioCall = (friend: any) => {
		if (isCalling || isInCall) {
			alert("현재 다른 통화가 진행 중입니다.");
			return;
		}
		selectFriend(friend);
		initiateCall("audio");
	};

	const handleVideoCall = (friend: any) => {
		if (isCalling || isInCall) {
			alert("현재 다른 통화가 진행 중입니다.");
			return;
		}
		selectFriend(friend);
		initiateCall("video");
	};

	return (
		<Container padding={`${theme.spacing.lg}`} maxWidth='700px'>
			<h2 style={{ fontFamily: theme.fonts.secondary, marginBottom: theme.spacing.md }}>
				📞 친구 목록
			</h2>
			{friends.map((friend) => (
				<Card key={friend.id}>
					<div style={{ display: "flex", alignItems: "center" }}>
						<ProfileImage src={friend.profileImage} alt={friend.name} />
						<FriendName>{friend.name}</FriendName>
					</div>
					<ButtonsSection>
						<BaseButton
							variant='primary'
							onClick={() => handleAudioCall(friend)}
							disabled={isCalling || isInCall}
						>
							<i className='fas fa-phone' /> 통화
						</BaseButton>
						<BaseButton
							variant='videoCall'
							onClick={() => handleVideoCall(friend)}
							disabled={isCalling || isInCall}
						>
							<i className='fas fa-video' /> 영상 통화
						</BaseButton>
					</ButtonsSection>
				</Card>
			))}
		</Container>
	);
};

export default FriendsList;
