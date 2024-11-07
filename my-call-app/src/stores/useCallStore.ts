// src/stores/useCallStore.ts
import { create } from "zustand";

type CallState = "idle" | "calling" | "ringing" | "accepted" | "rejected";

interface User {
	id: number;
	name: string;
	profileImage: string;
}

interface CallStore {
	callStatus: CallState;
	selectedUser: User | null;
	initiateCall: (user: User) => void;
	receiveCall: () => void;
	acceptCall: () => void;
	rejectCall: () => void;
	endCall: () => void;
}

export const useCallStore = create<CallStore>((set) => ({
	callStatus: "idle",
	selectedUser: null,
	initiateCall: (user) => set({ callStatus: "calling", selectedUser: user }),
	receiveCall: () => set({ callStatus: "ringing" }),
	acceptCall: () => set({ callStatus: "accepted" }),
	rejectCall: () => set({ callStatus: "idle", selectedUser: null }),
	endCall: () => set({ callStatus: "idle", selectedUser: null }),
}));
