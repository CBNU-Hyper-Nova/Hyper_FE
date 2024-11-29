// src/components/VideoCall.tsx
import React, { useRef, useEffect } from "react";
import { useCallStore } from "../store/callStore";
import DetectedSentence from "./DetectedSentence";
import styled from "styled-components";
import { theme } from "../theme";

const VideoContainer = styled.div`
	position: relative;
	width: 80%;
	max-width: 800px;
	margin: 20px auto;
	border-radius: 15px;
	overflow: hidden;
	background-color: black;
	box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
`;

const VideoElement = styled.video`
	width: 100%;
	height: auto;
	object-fit: cover;
`;

const PlaceholderImage = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-image: url("/default-profile.png");
	background-size: cover;
	background-position: center;
`;

const SmallVideo = styled.video`
	position: absolute;
	width: 25%;
	bottom: 20px;
	right: 20px;
	border: 2px solid ${theme.colors.white};
	border-radius: 10px;
	box-shadow: 0 2px 15px rgba(0, 0, 0, 0.2);
	background-color: black;
`;

const Controls = styled.div`
	position: absolute;
	bottom: 20px;
	left: 20px;
	display: flex;
`;

const ControlButton = styled.button`
	background-color: rgba(0, 0, 0, 0.5);
	border: none;
	color: ${theme.colors.white};
	padding: 15px;
	margin-right: 10px;
	font-size: 24px;
	cursor: pointer;
	border-radius: 50%;
	&:hover {
		background-color: rgba(0, 0, 0, 0.7);
	}
	i {
		margin: 0;
	}
`;

const EndCallButton = styled(ControlButton)`
	background-color: ${theme.colors.danger};
	&:hover {
		background-color: #a5001a;
	}
`;

const VideoCall: React.FC = () => {
	const localVideoRef = useRef<HTMLVideoElement>(null);
	const remoteVideoRef = useRef<HTMLVideoElement>(null);
	const {
		endCall,
		setDetectedSentence,
		cameraOn,
		micOn,
		localStream,
		remoteStream,
		setLocalStream,
		setRemoteStream,
	} = useCallStore();

	useEffect(() => {
		// 로컬 스트림 설정
		const getLocalStream = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: true,
					audio: true,
				});
				setLocalStream(stream);
				if (localVideoRef.current) {
					localVideoRef.current.srcObject = stream;
				}
				// 원격 스트림 설정
				// TODO: 실제 구현 시 주석 해제
				/*
        const remoteStream = await createRemoteStream();
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        */
				// 모킹용 코드 (테스트를 위해 샘플 비디오 사용)
				const remoteVideo = await fetch("/sample-video.mp4");
				const remoteVideoBlob = await remoteVideo.blob();
				const remoteVideoURL = URL.createObjectURL(remoteVideoBlob);
				if (remoteVideoRef.current) {
					remoteVideoRef.current.src = remoteVideoURL;
				}
			} catch (error) {
				console.error("로컬 스트림 가져오기 실패:", error);
			}
		};

		getLocalStream();

		return () => {
			// 스트림 정리
			if (localStream) {
				localStream.getTracks().forEach((track) => track.stop());
			}
			if (remoteStream) {
				remoteStream.getTracks().forEach((track) => track.stop());
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		// 마이크 On/Off 처리
		if (localStream) {
			localStream.getAudioTracks().forEach((track) => {
				track.enabled = micOn;
			});
		}
	}, [micOn, localStream]);

	useEffect(() => {
		// 카메라 On/Off 처리
		if (localStream) {
			localStream.getVideoTracks().forEach((track) => {
				track.enabled = cameraOn;
			});
		}
		// 작은 화면이 카메라 On/Off에 따라 나타나도록 설정
		if (cameraOn) {
			if (localVideoRef.current) {
				localVideoRef.current.srcObject = localStream;
			}
		} else {
			if (localVideoRef.current) {
				localVideoRef.current.srcObject = null;
			}
		}
	}, [cameraOn, localStream]);

	useEffect(() => {
		// 디텍션 모킹
		let intervalId: NodeJS.Timeout;
		intervalId = setInterval(() => {
			const sentences = [
				"안녕하세요",
				"반갑습니다",
				"도와드릴까요",
				"괜찮습니다",
				"감사합니다",
				"좋은 하루 되세요",
			];
			const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
			setDetectedSentence(randomSentence);
		}, 3000);

		return () => {
			if (intervalId) clearInterval(intervalId);
		};
	}, [setDetectedSentence]);

	return (
		<div>
			<VideoContainer>
				{/* 상대방 영상 */}
				<VideoElement ref={remoteVideoRef} autoPlay playsInline />
				{/* 상대방 카메라가 꺼졌을 때 프로필 이미지 표시 */}
				{!remoteStream && <PlaceholderImage />}
				{/* 자신의 영상 (작은 화면) */}
				{cameraOn && <SmallVideo ref={localVideoRef} autoPlay playsInline />}
				{/* 컨트롤 버튼들 */}
				<Controls>
					<ControlButton onClick={() => useCallStore.getState().toggleCamera()}>
						{cameraOn ? <i className='fas fa-video' /> : <i className='fas fa-video-slash' />}
					</ControlButton>
					<ControlButton onClick={() => useCallStore.getState().toggleMic()}>
						{micOn ? (
							<i className='fas fa-microphone' />
						) : (
							<i className='fas fa-microphone-slash' />
						)}
					</ControlButton>
					<EndCallButton onClick={endCall}>
						<i className='fas fa-phone-slash' />
					</EndCallButton>
				</Controls>
			</VideoContainer>
			<DetectedSentence />
		</div>
	);
};

export default VideoCall;
