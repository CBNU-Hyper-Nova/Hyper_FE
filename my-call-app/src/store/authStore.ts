import { create } from "zustand";

interface AuthState {
	isAuthenticated: boolean;
	user: string | null;
	login: (username: string, password: string) => Promise<void>;
	logout: () => void;
	signUp: (username: string, password: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
	isAuthenticated: false,
	user: null,
	login: async (username, password) => {
		// TODO: 백엔드에 로그인 요청
		// const response = await fetch('/api/login', { ... });
		// const data = await response.json();

		// 임시로 로그인 처리
		if (username && password) {
			set({ isAuthenticated: true, user: username });
		}
	},
	logout: () => set({ isAuthenticated: false, user: null }),
	signUp: async (username, password) => {
		// TODO: 백엔드에 회원가입 요청
		// const response = await fetch('/api/signup', { ... });
		// const data = await response.json();

		// 임시로 회원가입 처리
		if (username && password) {
			set({ isAuthenticated: true, user: username });
		}
	},
}));
