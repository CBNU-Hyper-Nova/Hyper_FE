// src/store/callStore.ts
import { create } from "zustand";

interface Friend {
	id: number;
	name: string;
	profileImage?: string;
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
	callerInfo: {
		id: string;
		type: string;
	} | null;
	isPending: boolean;

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
	setIsReceiving: (isReceiving: boolean) => void;
	setIsPending: (isPending: boolean) => void;
	setCallerInfo: (callerInfo: CallState['callerInfo']) => void;
	setIsCalling: (isCalling: boolean) => void;
	setIsInCall: (isInCall: boolean) => void;
}

export const useCallStore = create<CallState>((set) => ({
	friends: [
		{ 
			id: 1, 
			name: "박유경", 
			signalingId: "박유경",
			profileImage: "https://via.placeholder.com/50" 
		},
		{ 
			id: 2, 
			name: "강재구", 
			signalingId: "강재구",
			profileImage: "https://via.placeholder.com/50"
		}
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
	callerInfo: null,
	isPending: false,

	selectFriend: (friend) => set({ selectedFriend: friend }),
	startCall: (type) => {
		console.log('startCall 호출됨:', type);
		set({ 
			isCalling: true, 
			isCallPending: true,
			callType: type 
		});
	},
	receiveCall: () => set({
		isReceiving: false,
		isInCall: true,
		isCalling: false,
		isPending: false,
		callType: 'video'
	}),
	rejectCall: () => set({
		isReceiving: false,
		isInCall: false,
		isCalling: false,
		isPending: false,
		callerInfo: null
	}),
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
	setIsReceiving: (isReceiving: boolean) => {
		console.log('setIsReceiving:', isReceiving);
		set({ isReceiving });
	},
	setIsPending: (isPending) => {
		console.log('setIsPending 호출됨:', isPending);
		set({ isPending });
	},
	setCallerInfo: (callerInfo: CallState['callerInfo']) => {
		console.log('setCallerInfo:', callerInfo);
		set({ callerInfo });
	},
	setIsCalling: (isCalling) => {
		console.log('setIsCalling 호출됨:', isCalling);
		set((state) => ({ ...state, isCalling }));
	},
	setIsInCall: (isInCall) => set({ isInCall }),
}));
