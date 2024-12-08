// src/store/callStore.ts
import { create } from "zustand";

interface Friend {
	id: number;
	name: string;
	profileImage: string;
	signalingId: string;
}

type CallType = "audio" | "video";

interface CallState {
	friends: Friend[];
	selectedFriend: Friend | null;
	isCalling: boolean;
	isReceiving: boolean;
	isInCall: boolean;
	isCallPending: boolean;
	detectedSentence: string;
	localStream: MediaStream | null;
	remoteStream: MediaStream | null;
	cameraOn: boolean;
	micOn: boolean;
	callType: CallType | null;
	signalingId: string | null;
	peerConnection: RTCPeerConnection | null;
	signaling: WebSocket | null;

	selectFriend: (friend: Friend) => void;
	startCall: (type: CallType) => void;
	receiveCall: () => void;
	rejectCall: () => void;
	endCall: () => void;
	setDetectedSentence: (sentence: string) => void;
	toggleCamera: () => void;
	toggleMic: () => void;
	setLocalStream: (stream: MediaStream) => void;
	setRemoteStream: (stream: MediaStream) => void;
	setSignalingId: (id: string) => void;
	setPeerConnection: (pc: RTCPeerConnection) => void;
	setSignaling: (ws: WebSocket) => void;
}

export const useCallStore = create<CallState>((set) => ({
	friends: [
		{ id: 1, name: "박유경", profileImage: "/profiles/park.jpg", signalingId: "signal-1" },
		{ id: 2, name: "최가은", profileImage: "/profiles/choi.jpg", signalingId: "signal-2" },
		{ id: 3, name: "박상준", profileImage: "/profiles/park2.jpg", signalingId: "signal-3" },
	],
	selectedFriend: null,
	isCalling: false,
	isReceiving: false,
	isInCall: false,
	isCallPending: false,
	detectedSentence: "",
	localStream: null,
	remoteStream: null,
	cameraOn: true,
	micOn: true,
	callType: null,
	signalingId: null,
	peerConnection: null,
	signaling: null,

	selectFriend: (friend) => set({ selectedFriend: friend }),
	startCall: (type) => set({ isCalling: true, isCallPending: true, callType: type }),
	receiveCall: () => set({ isReceiving: false, isInCall: true }),
	rejectCall: () => set({ isReceiving: false, isCallPending: false, callType: null }),
	endCall: () =>
		set({
			isCalling: false,
			isInCall: false,
			isCallPending: false,
			detectedSentence: "",
			localStream: null,
			remoteStream: null,
			selectedFriend: null,
			callType: null,
			peerConnection: null,
			signaling: null,
		}),
	setDetectedSentence: (sentence) => set({ detectedSentence: sentence }),
	toggleCamera: () => set((state) => ({ cameraOn: !state.cameraOn })),
	toggleMic: () => set((state) => ({ micOn: !state.micOn })),
	setLocalStream: (stream) => set({ localStream: stream }),
	setRemoteStream: (stream) => set({ remoteStream: stream }),
	setSignalingId: (id) => set({ signalingId: id }),
	setPeerConnection: (pc) => set({ peerConnection: pc }),
	setSignaling: (ws) => set({ signaling: ws }),
}));
