import { create } from "zustand";

interface User {
	username: string;
	signalingId: string;
}

interface AuthState {
	isAuthenticated: boolean;
	user: User | null;
	login: (username: string, password: string) => Promise<void>;
	logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	isAuthenticated: false,
	user: null,
	login: async (username: string, password: string) => {
		try {
			const response = await fetch("http://localhost:8679/user/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: 'include',
				body: JSON.stringify({ username, password }),
			});

			if (!response.ok) {
				throw new Error("로그인 실패");
			}

			const data = await response.json();
			
			set({ 
				isAuthenticated: true,
				user: {
					username: data.username,
					signalingId: data.signalingId || username
				}
			});
		} catch (error) {
			console.error("로그인 오류:", error);
			throw error;
		}
	},
	logout: () => set({ isAuthenticated: false, user: null })
}));
