// src/components/VideoCall.tsx
import React, { useRef, useEffect, useState } from "react";
import { useCallStore } from "../store/callStore";
import DetectedSentence from "./DetectedSentence";
import styled, { keyframes } from "styled-components";
import { theme } from "../theme";
import { Holistic } from "@mediapipe/holistic";
import { Camera } from "@mediapipe/camera_utils";
import { useSignaling } from "../hooks/useSignaling";
import ToggleButton from "./ToggleButton";

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const VideoContainer = styled.div`
	position: relative;
	width: 100%;
	height: 100vh;
`;

const MainVideo = styled.video`
	width: 100%;
	height: 100%;
	object-fit: cover;
`;

const LocalVideo = styled.video`
	position: absolute;
	bottom: 20px;
	right: 20px;
	width: 240px;
	height: 180px;
	border-radius: 8px;
	object-fit: cover;
	border: 2px solid white;
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
	bottom: ${theme.spacing.sm};
	right: ${theme.spacing.sm};
	border: 2px solid ${theme.colors.white};
	border-radius: ${theme.radius.sm};
	box-shadow: ${theme.shadows.light};
	background-color: black;

	@media (max-width: ${theme.breakpoints.mobile}) {
		width: 30%;
	}
`;

const Controls = styled.div`
	position: absolute;
	bottom: ${theme.spacing.sm};
	left: ${theme.spacing.sm};
	display: flex;
	gap: ${theme.spacing.sm};
`;

const ControlButton = styled.button`
	background-color: rgba(0, 0, 0, 0.5);
	border: none;
	color: ${theme.colors.white};
	padding: ${theme.spacing.sm};
	margin-right: ${theme.spacing.sm};
	font-size: 24px;
	cursor: pointer;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: background-color ${theme.transitions.fast};

	&:hover {
		background-color: rgba(0, 0, 0, 0.7);
	}

	i {
		margin: 0;
	}

	@media (max-width: ${theme.breakpoints.mobile}) {
		font-size: 20px;
		padding: ${theme.spacing.xs};
	}
`;

const EndCallButton = styled(ControlButton)`
	background-color: ${theme.colors.danger};

	&:hover {
		background-color: #a5001a;
	}
`;

const Header = styled.div`
	background-color: ${theme.colors.primary};
	color: ${theme.colors.white};
	padding: ${theme.spacing.sm};
	text-align: center;
	font-size: 20px;
	border-top-left-radius: ${theme.radius.lg};
	border-top-right-radius: ${theme.radius.lg};
`;

const VideoCall: React.FC = () => {
	useSignaling(); // 시그널링 초기화

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
		callType,
		peerConnection,
		selectedFriend,
		signalingId,
	} = useCallStore();

	const holisticRef = useRef<Holistic | null>(null);
	const cameraRef = useRef<Camera | null>(null);
	const [frameNum, setFrameNum] = useState(0); // 프레임 번호 관리

	useEffect(() => {
		// MediaPipe Holistic 모델 초기화
		const initHolistic = async () => {
			const { Holistic } = await import("@mediapipe/holistic");
			const { drawConnectors, drawLandmarks } = await import("@mediapipe/drawing_utils");

			holisticRef.current = new Holistic({
				locateFile: (file) => {
					return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
				},
			});

			holisticRef.current.setOptions({
				modelComplexity: 1,
				smoothLandmarks: true,
				minDetectionConfidence: 0.5,
				minTrackingConfidence: 0.5,
			});

			holisticRef.current.onResults(onResults);

			if (localVideoRef.current) {
				cameraRef.current = new Camera(localVideoRef.current, {
					onFrame: async () => {
						if (holisticRef.current && localVideoRef.current) {
							await holisticRef.current.send({ image: localVideoRef.current });
						}
					},
					width: 640,
					height: 480,
				});
				cameraRef.current.start();
			}
		};

		initHolistic();

		// Clean up
		return () => {
			if (holisticRef.current) {
				holisticRef.current.close();
			}
			if (cameraRef.current) {
				cameraRef.current.stop();
			}
		};
	}, []);

	const onResults = (results: any) => {
		// 키포인트 추출
		const keypoints = extractKeypoints(results);
		if (!keypoints) {
			// 키포인트가 제대로 추출되지 않았을 경우
			console.warn("키포인트를 추출하지 못했습니다.");
			return;
		}
		// 타임스탬프 생성
		const timestamp = Date.now();
		// 프레임 번호 증가
		setFrameNum((prev) => prev + 1);
		// 키포인트와 타임스탬프를 백엔드로 전송
		sendKeypointsToBackend(frameNum, keypoints, timestamp);
	};

	const extractKeypoints = (results: any) => {
		const poseLandmarks = results.poseLandmarks || [];
		const leftHandLandmarks = results.leftHandLandmarks || [];
		const rightHandLandmarks = results.rightHandLandmarks || [];

		const poseCount = 33;
		const handCount = 21;

		// 포즈 랜드마크 (33개)
		const pose = Array.from({ length: poseCount }, (_, i) => {
			const landmark = poseLandmarks[i];
			return landmark ? [landmark.x, landmark.y, landmark.z] : [0, 0, 0];
		});

		// 왼손 랜드마크 (21개)
		const leftHand = Array.from({ length: handCount }, (_, i) => {
			const landmark = leftHandLandmarks[i];
			return landmark ? [landmark.x, landmark.y, landmark.z] : [0, 0, 0];
		});

		// 오른손 랜드마크 (21개)
		const rightHand = Array.from({ length: handCount }, (_, i) => {
			const landmark = rightHandLandmarks[i];
			return landmark ? [landmark.x, landmark.y, landmark.z] : [0, 0, 0];
		});

		// 키포인트를 하나의 배열로 결합 (75 x 3 = 225)
		const keypoints = [...pose, ...leftHand, ...rightHand].flat(); // [x1, y1, z1, ..., x75, y75, z75]

		return keypoints;
	};

	const sendKeypointsToBackend = async (
		frame_num: number,
		keypoints: number[],
		timestamp: number
	) => {
		try {
			if (keypoints.length !== 225) {
				console.error(`Invalid keypoints length: ${keypoints.length}. Expected 225.`);
				return;
			}

			// const response = await fetch("http://localhost:5001/process-keypoints", {
			// 	method: "POST",
			// 	headers: {
			// 		"Content-Type": "application/json",
			// 	},
			// 	body: JSON.stringify({ frame_num, keypoints, timestamp }),
			// });

			if (response.ok) {
				const data = await response.json();
				// 받은 데이터: { timestamp: number, sentence: string }
				if (data.sentence) {
					setDetectedSentence(data.sentence);
				}
			} else {
				const errorData = await response.json();
				//console.error("백엔드 응답 오류:", errorData.error || response.statusText);
			}
		} catch (error) {
			//console.error("백엔드 전송 오류:", error);
		}
	};

	useEffect(() => {
		// 로컬 비디오 스트림 설정
		const setupLocalStream = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: true,
					audio: true
				});
				
				setLocalStream(stream);
				
				if (localVideoRef.current) {
					localVideoRef.current.srcObject = stream;
				}
			} catch (error) {
				console.error('로컬 스트림 설정 오류:', error);
			}
		};

		if (!localStream) {
			setupLocalStream();
		} else if (localVideoRef.current) {
			localVideoRef.current.srcObject = localStream;
		}

		// 원격 비디오 스트림 설정
		if (remoteVideoRef.current && remoteStream) {
			remoteVideoRef.current.srcObject = remoteStream;
		}

		// cleanup
		return () => {
			if (localStream) {
				localStream.getTracks().forEach(track => track.stop());
			}
		};
	}, [localStream, remoteStream]);

	useEffect(() => {
		// 카메라 On/Off 처리 (비디오 통화인 경우에만 작동)
		if (callType === "video" && localStream) {
			localStream.getVideoTracks().forEach((track) => {
				track.enabled = cameraOn;
			});
		}
	}, [cameraOn, localStream, callType]);

	return (
		<div>
			{useCallStore.getState().isInCall && selectedFriend && (
				<Header>
					{callType === "audio" ? "🎤 오디오 통화 중" : "📹 영상 통화 중"} - {selectedFriend.name}
				</Header>
			)}
			<VideoContainer>
				<MainVideo ref={remoteVideoRef} autoPlay playsInline />
				<LocalVideo ref={localVideoRef} autoPlay playsInline muted />
				{/* 컨트롤 버튼들 */}
				<Controls>
					<ToggleButton type='camera' />
					<ToggleButton type='mic' />
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
