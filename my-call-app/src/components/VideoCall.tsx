// src/components/VideoCall.tsx
import React, { useRef, useEffect, useState } from "react";
import { useCallStore } from "../store/callStore";
import DetectedSentence from "./DetectedSentence";
import styled from "styled-components";
import { theme } from "../theme";
import { Holistic } from "@mediapipe/holistic";
import { Camera } from "@mediapipe/camera_utils";

// 스타일 컴포넌트
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
	display: flex;
	align-items: center;
	justify-content: center;

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

			const response = await fetch("http://localhost:5001/process-keypoints", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ frame_num, keypoints, timestamp }),
			});

			if (response.ok) {
				const data = await response.json();
				// 받은 데이터: { timestamp: number, sentence: string }
				if (data.sentence) {
					setDetectedSentence(data.sentence);
				}
			} else {
				const errorData = await response.json();
				console.error("백엔드 응답 오류:", errorData.error || response.statusText);
			}
		} catch (error) {
			console.error("백엔드 전송 오류:", error);
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
				{/* 상대방 카메라가 꺼졌을 때 프로필 이미지 표시 */}
				{!remoteStream && <PlaceholderImage />}
				{/* 자신의 영상 (작은 화면) */}
				{cameraOn && <SmallVideo ref={localVideoRef} autoPlay playsInline muted />}
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
