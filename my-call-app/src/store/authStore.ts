import { create } from "zustand";

interface AuthState {
	isAuthenticated: boolean;
	token: string | null;
	login: (username: string, password: string) => Promise<void>;
	signup: (username: string, password: string) => Promise<void>;
	logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	isAuthenticated: false,
	token: null,
	login: async (username, password) => {
		try {
			const response = await fetch("http://localhost:8081/user/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ username, password }),
			});

			if (response.ok) {
				const data = await response.json();
				set({ isAuthenticated: true, token: data.token });
				localStorage.setItem("token", data.token);
			} else {
				const errorData = await response.json();
				throw new Error(errorData.error || "로그인에 실패했습니다.");
			}
		} catch (error) {
			console.error("로그인 오류:", error);
			throw error;
		}
	},
	signup: async (username, password) => {
		try {
			const response = await fetch("http://localhost:8081/user/signup", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ username, password }),
			});

			if (response.ok) {
				const data = await response.json();
				set({ isAuthenticated: true, token: data.token });
				localStorage.setItem("token", data.token);
			} else {
				const errorData = await response.json();
				throw new Error(errorData.error || "회원가입에 실패했습니다.");
			}
		} catch (error) {
			console.error("회원가입 오류:", error);
			throw error;
		}
	},
	logout: () => {
		set({ isAuthenticated: false, token: null });
		localStorage.removeItem("token");
	},
}));
