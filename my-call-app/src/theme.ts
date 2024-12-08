// src/theme.ts
export const theme = {
	colors: {
		primary: "#4A90E2",
		primaryDark: "#357ABD",
		secondary: "#50E3C2",
		accent: "#9013FE",
		danger: "#D0021B",
		videoCall: "#28A745",
		videoCallDark: "#218838",
		grey: "#CCCCCC",
		background: "linear-gradient(135deg, #ece9e6, #ffffff)", // 부드러운 그라데이션 배경
		text: "#333333",
		white: "#FFFFFF",
		modalOverlay: "rgba(0, 0, 0, 0.6)", // 모달 오버레이 색상
	},
	fonts: {
		primary: "'Montserrat', sans-serif",
		secondary: "'Noto Sans KR', sans-serif",
	},
	spacing: {
		xs: "4px",
		sm: "8px",
		md: "16px",
		lg: "24px",
		xl: "32px",
	},
	radius: {
		sm: "5px",
		md: "10px",
		lg: "15px",
		round: "50px",
	},
	shadows: {
		light: "0 2px 10px rgba(0, 0, 0, 0.1)",
		medium: "0 4px 15px rgba(0, 0, 0, 0.2)",
		heavy: "0 4px 30px rgba(0, 0, 0, 0.3)",
	},
	transitions: {
		fast: "0.2s ease-in-out",
		normal: "0.3s ease-in-out",
	},
	breakpoints: {
		mobile: "480px",
		tablet: "768px",
		desktop: "1024px",
	},
};
