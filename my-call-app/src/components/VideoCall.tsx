// src/components/VideoCall.tsx
import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import { useCallStore } from "../store/callStore";
import { theme } from "../theme";
import { Holistic } from "@mediapipe/holistic";
import { Camera } from "@mediapipe/camera_utils";
import DetectedSentence from "./DetectedSentence";

// 스타일 정의
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

const FRAME_BATCH_SIZE = 120; // 120프레임 (약 4초 정도 assuming 30fps)

const VideoCall: React.FC = () => {
	const localVideoRef = useRef<HTMLVideoElement>(null);
	const remoteVideoRef = useRef<HTMLVideoElement>(null);

	const { endCall, setDetectedSentence, cameraOn, micOn, localStream, remoteStream } =
		useCallStore();

	const holisticRef = useRef<Holistic | null>(null);
	const cameraRef = useRef<Camera | null>(null);

	// 프레임 처리 관련 변수
	const [landmarkDataBuffer, setLandmarkDataBuffer] = useState<any[]>([]);
	const frameCounterRef = useRef<number>(0);

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
			if (holisticRef.current) {
				holisticRef.current.close();
			}
			if (cameraRef.current) {
				cameraRef.current.stop();
			}
		};
	}, []);

	const onResults = (results: any) => {
		frameCounterRef.current++;
		const frame_num = frameCounterRef.current;
		// Mediapipe 결과에서 랜드마크 추출
		const poseLandmarks = results.poseLandmarks || [];
		const leftHandLandmarks = results.leftHandLandmarks || [];
		const rightHandLandmarks = results.rightHandLandmarks || [];

		const now = Date.now(); // 현재 타임스탬프(ms)
		const currentFrameData: any[] = [];

		// pose: 33개 가정
		poseLandmarks.forEach((lm: any, idx: number) => {
			currentFrameData.push({
				frame_num,
				landmark_type: "pose",
				index: idx,
				x: lm.x,
				y: lm.y,
				z: lm.z,
				time: now,
				label: "", // 현재 레이블 없음
			});
		});

		// left_hand: 21개 가정
		leftHandLandmarks.forEach((lm: any, idx: number) => {
			currentFrameData.push({
				frame_num,
				landmark_type: "left_hand",
				index: idx,
				x: lm.x,
				y: lm.y,
				z: lm.z,
				time: now,
				label: "",
			});
		});

		// right_hand: 21개 가정
		rightHandLandmarks.forEach((lm: any, idx: number) => {
			currentFrameData.push({
				frame_num,
				landmark_type: "right_hand",
				index: idx,
				x: lm.x,
				y: lm.y,
				z: lm.z,
				time: now,
				label: "",
			});
		});

		setLandmarkDataBuffer((prev) => [...prev, ...currentFrameData]);

		// 120프레임마다 전송
		if (frame_num % FRAME_BATCH_SIZE === 0) {
			sendDataToBackend();
		}
	};

	const sendDataToBackend = async () => {
		const timestamp = Date.now();
		const dataToSend = {
			timestamp: timestamp,
			data: landmarkDataBuffer,
		};

		console.log(`>> ${FRAME_BATCH_SIZE}프레임 데이터 전송 시작 (약 4초치 데이터)`);
		console.log("전송할 데이터 크기:", dataToSend.data.length);
		console.log("전송 타임스탬프:", timestamp);

		try {
			const response = await fetch("http://localhost:5000/process-keypoints", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(dataToSend),
			});

			if (!response.ok) {
				console.error("백엔드 응답 오류:", response.statusText);
				return;
			}

			const result = await response.json();
			console.log("백엔드 응답:", result);
			setDetectedSentence(result.sentence);
		} catch (error) {
			console.error("백엔드 전송 오류:", error);
		} finally {
			// 전송 후 버퍼 초기화
			setLandmarkDataBuffer([]);
			console.log(">> 전송 완료, 버퍼 초기화");
		}
	};

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
		// 원격 스트림 설정
		// TODO: 실제 구현 시 주석 해제
		/*
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
    */
		// 모킹용 코드 (테스트를 위해 샘플 비디오 사용)
		if (remoteVideoRef.current) {
			remoteVideoRef.current.src = "/sample-video.mp4";
		}
	}, [remoteStream]);

	return (
		<div>
			<VideoContainer>
				{/* 상대방 영상 */}
				<VideoElement ref={remoteVideoRef} autoPlay playsInline muted />
				{!remoteStream && <PlaceholderImage />}
				{/* 자신의 영상 */}
				{cameraOn && <SmallVideo ref={localVideoRef} autoPlay playsInline muted />}
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
