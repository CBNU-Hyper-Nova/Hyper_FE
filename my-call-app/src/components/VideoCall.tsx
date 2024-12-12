// src/components/VideoCall.tsx
import React, { useRef, useEffect, useState } from "react";
import { useCallStore } from "../store/callStore";
import DetectedSentence from "./DetectedSentence";
import styled, { keyframes } from "styled-components";
import { theme } from "../theme";
import { Holistic } from "@mediapipe/holistic";
import { Camera } from "@mediapipe/camera_utils";
import { useSignaling } from "../hooks/useSignaling";

import {
	FaMicrophone,
	FaMicrophoneSlash,
	FaVideo,
	FaVideoSlash,
	FaPhoneSlash,
} from "react-icons/fa";

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
	width: 100vw;
	height: auto;
	background-color: black;
	border-radius: 8px;
	&:before {
		content: "";
		display: block;
		padding-top: 56.25%; /* 16:9 비율 */
	}
`;

const MainVideo = styled.video`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	border-radius: 8px;
	object-fit: cover;
	background-color: black;
`;

const LocalVideo = styled.video`
	position: absolute;
	bottom: 20px;
	right: 20px;
	width: 20%;
	height: auto;
	aspect-ratio: 16 / 9;
	border-radius: 8px;
	border: 2px solid white;
	object-fit: cover;
	background-color: black;

	@media (max-width: ${theme.breakpoints.tablet}) {
		width: 35%;
	}

	@media (max-width: ${theme.breakpoints.mobile}) {
		width: 35%;
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
		callType,
		toggleCamera,
		toggleMic,
	} = useCallStore();

	const holisticRef = useRef<Holistic | null>(null);
	const cameraRef = useRef<Camera | null>(null);
	const [frameNum, setFrameNum] = useState(0);

	useEffect(() => {
		const initHolistic = async () => {
			const { Holistic } = await import("@mediapipe/holistic");

			holisticRef.current = new Holistic({
				locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
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

		return () => {
			if (holisticRef.current) holisticRef.current.close();
			if (cameraRef.current) cameraRef.current.stop();
		};
	}, []);

	const onResults = (results: any) => {
		const keypoints = extractKeypoints(results);
		if (!keypoints) return;
		const timestamp = Date.now();
		setFrameNum((prev) => prev + 1);
		sendKeypointsToBackend(frameNum, keypoints, timestamp);
	};

	const extractKeypoints = (results: any) => {
		const poseLandmarks = results.poseLandmarks || [];
		const leftHandLandmarks = results.leftHandLandmarks || [];
		const rightHandLandmarks = results.rightHandLandmarks || [];

		const poseCount = 33;
		const handCount = 21;

		const pose = Array.from({ length: poseCount }, (_, i) => {
			const landmark = poseLandmarks[i];
			return landmark ? [landmark.x, landmark.y, landmark.z] : [0, 0, 0];
		});

		const leftHand = Array.from({ length: handCount }, (_, i) => {
			const landmark = leftHandLandmarks[i];
			return landmark ? [landmark.x, landmark.y, landmark.z] : [0, 0, 0];
		});

		const rightHand = Array.from({ length: handCount }, (_, i) => {
			const landmark = rightHandLandmarks[i];
			return landmark ? [landmark.x, landmark.y, landmark.z] : [0, 0, 0];
		});

		const keypoints = [...pose, ...leftHand, ...rightHand].flat();
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

			const response = await fetch("http://localhost:5001/process-keypoints", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ frame_num, keypoints, timestamp }),
			});

			if (response.ok) {
				const data = await response.json();
				if (data.sentence) setDetectedSentence(data.sentence);
			} else {
				const errorData = await response.json();
				console.error("백엔드 응답 오류:", errorData.error || response.statusText);
			}
		} catch (error) {
			console.error("백엔드 전송 오류:", error);
		}
	};

	// 로컬 스트림 초기화 및 상태 관리
	useEffect(() => {
		const setupLocalStream = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
				setLocalStream(stream);
				if (localVideoRef.current) {
					localVideoRef.current.srcObject = stream;
				}
			} catch (error) {
				console.error("로컬 스트림 설정 오류:", error);
			}
		};

		if (!localStream) {
			setupLocalStream();
		} else if (localVideoRef.current) {
			localVideoRef.current.srcObject = localStream;
		}

		if (remoteVideoRef.current) {
			if (remoteStream) {
				remoteVideoRef.current.srcObject = remoteStream;
			} else if (localStream) {
				remoteVideoRef.current.srcObject = localStream;
			}
		}

		return () => {
			if (localStream) {
				localStream.getTracks().forEach((track) => track.stop());
			}
		};
	}, [localStream, remoteStream, setLocalStream]);

	// 캠 상태 반영
	useEffect(() => {
		if (localStream) {
			localStream.getVideoTracks().forEach((track) => {
				track.enabled = cameraOn;
			});
		}
	}, [cameraOn, localStream]);

	// 마이크 상태 반영
	useEffect(() => {
		if (localStream) {
			localStream.getAudioTracks().forEach((track) => {
				track.enabled = micOn;
			});
		}
	}, [micOn, localStream]);

	return (
		<div>
			<VideoContainer>
				<MainVideo
					ref={remoteVideoRef}
					autoPlay
					playsInline
					muted={!remoteStream}
					onLoadedMetadata={() => {
						if (remoteVideoRef.current) {
							remoteVideoRef.current.play().catch((err) => console.error("비디오 재생 오류:", err));
						}
					}}
				/>
				<LocalVideo ref={localVideoRef} autoPlay playsInline muted />

				<Controls>
					<ControlButton onClick={toggleCamera}>
						{cameraOn ? <FaVideo /> : <FaVideoSlash />}
					</ControlButton>
					<ControlButton onClick={toggleMic}>
						{micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
					</ControlButton>
					<EndCallButton onClick={endCall}>
						<FaPhoneSlash />
					</EndCallButton>
				</Controls>
			</VideoContainer>
			<DetectedSentence />
		</div>
	);
};

export default VideoCall;
