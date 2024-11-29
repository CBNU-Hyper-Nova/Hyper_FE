// src/store/callStore.ts
import { create } from "zustand";

interface Friend {
	id: number;
	name: string;
	profileImage: string;
}

interface CallState {
	friends: Friend[];
	selectedFriend: Friend | null;
	isCalling: boolean;
	isReceiving: boolean;
	isInCall: boolean;
	isCallPending: boolean; // 추가된 상태
	detectedSentence: string;
	localStream: MediaStream | null;
	remoteStream: MediaStream | null;
	cameraOn: boolean;
	micOn: boolean;
	selectFriend: (friend: Friend) => void;
	startCall: () => void;
	receiveCall: () => void;
	rejectCall: () => void;
	endCall: () => void;
	setDetectedSentence: (sentence: string) => void;
	toggleCamera: () => void;
	toggleMic: () => void;
	setLocalStream: (stream: MediaStream) => void;
	setRemoteStream: (stream: MediaStream) => void;
}

export const useCallStore = create<CallState>((set) => ({
	friends: [
		{ id: 1, name: "박유경", profileImage: "/profiles/park.jpg" },
		{ id: 2, name: "최가은", profileImage: "/profiles/choi.jpg" },
		{ id: 3, name: "박상준", profileImage: "/profiles/park2.jpg" },
	],
	selectedFriend: null,
	isCalling: false,
	isReceiving: false,
	isInCall: false,
	isCallPending: false, // 추가된 상태
	detectedSentence: "",
	localStream: null,
	remoteStream: null,
	cameraOn: true,
	micOn: true,
	selectFriend: (friend) => set({ selectedFriend: friend }),
	startCall: () => set({ isCalling: true, isCallPending: true }),
	receiveCall: () => set({ isReceiving: false, isInCall: true }),
	rejectCall: () => set({ isReceiving: false, isCallPending: false }),
	endCall: () =>
		set({
			isCalling: false,
			isInCall: false,
			isCallPending: false,
			detectedSentence: "",
			localStream: null,
			remoteStream: null,
			selectedFriend: null,
		}),
	setDetectedSentence: (sentence) => set({ detectedSentence: sentence }),
	toggleCamera: () => set((state) => ({ cameraOn: !state.cameraOn })),
	toggleMic: () => set((state) => ({ micOn: !state.micOn })),
	setLocalStream: (stream) => set({ localStream: stream }),
	setRemoteStream: (stream) => set({ remoteStream: stream }),
}));
