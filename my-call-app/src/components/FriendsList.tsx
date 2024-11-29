// src/components/FriendsList.tsx
import React from "react";
import { useCallStore } from "../store/callStore";
import styled from "styled-components";
import { theme } from "../theme";

const Container = styled.div`
	max-width: 600px;
	margin: 50px auto;
`;

const FriendItem = styled.div`
	background-color: ${theme.colors.white};
	border-radius: 10px;
	padding: 15px;
	margin: 10px 0;
	display: flex;
	align-items: center;
	cursor: pointer;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

	&:hover {
		background-color: ${theme.colors.background};
	}
`;

const ProfileImage = styled.img`
	width: 50px;
	height: 50px;
	border-radius: 50%;
	object-fit: cover;
	margin-right: 20px;
`;

const FriendName = styled.span`
	font-size: 18px;
	font-family: ${theme.fonts.secondary};
`;

const FriendsList: React.FC = () => {
	const { friends, selectFriend, startCall } = useCallStore();

	const handleCall = (friend: any) => {
		selectFriend(friend);
		startCall();
		// TODO: 실제 구현 시 시그널링 서버를 통해 상대방에게 통화 요청을 보냅니다.
	};

	return (
		<Container>
			<h2>📞 친구 목록</h2>
			{friends.map((friend) => (
				<FriendItem key={friend.id} onClick={() => handleCall(friend)}>
					<ProfileImage src={friend.profileImage} alt={friend.name} />
					<FriendName>{friend.name}</FriendName>
				</FriendItem>
			))}
		</Container>
	);
};

export default FriendsList;
