import "./App.css";
import { io } from "socket.io-client";
import { useEffect } from "react";
import { useState } from "react";
import dayjs from "dayjs";
const socket = io("http://localhost:4001/");

function App() {
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState([]);
	const [user, setUser] = useState("");
	const [users, setUsers] = useState([]);
	const [rooms, setRooms] = useState([]);
	const [room, setRoom] = useState("");
	const [showChat, setShowChat] = useState(false);

	const chooseUsername = (user) => {
		console.log(user);
		if (user !== "") {
			socket.emit("choose_username", user);
			setShowChat(true);
		}
	};

	const chooseRoomname = (room) => {
		if (room !== "") {
			socket.emit("join_room", room);
		}
	};

	useEffect(() => {
		socket.on("connection", (data) => {
			// console.log(data);
			setRooms(data.rooms);
			setUsers(data.users);
		});

		socket.on("get_users", (data) => {
			setUsers(data);
		});
		socket.on("update_room", (data) => {
			setRooms(data);
		});
		socket.on("deleted_room", (data) => {
			setRooms(data);
			setRoom("");
			setMessages([]);
		});
		// socket.on("deleted_user", (updatedUser) => {
		// 	setUsers(updatedUser);
		// });

		socket.on("sent_message", (data) => {
			setMessages(data);
		});
		socket.on("sent_message", () => {
			setMessages((prevMessage) => {
				return [...prevMessage];
			});
		});

		return () => socket.off();
	}, []);

	function handleMessage(msg) {
		socket.emit("message", {
			msg,
			roomName: room,
			username: user,
		});
	}

	const handleDelete = (roomName) => {
		socket.emit("delete_room", roomName);
	};

	const handleDeleteUser = (userId) => {
		socket.emit("delete_user", userId);

		// console.log("yooooooo");
	};

	return (
		<div className="App">
			{!showChat ? (
				<div className="joinChatContainer">
					<h3>Choose a username</h3>
					<input
						type="text"
						placeholder="John..."
						onChange={(event) => {
							setUser(event.target.value);
						}}
					/>
					<button onClick={() => chooseUsername(user)}>Accept</button>
				</div>
			) : (
				<header className="App-header">
					<div className="application">
						<div className="appLayout">
							<div className="sidebars">
								<div className="sidebarRoom">
									<p>ROOMS:</p>
									<input
										type="text"
										placeholder="Room ID..."
										onChange={(event) => {
											setRoom(event.target.value);
										}}
									/>
									<button
										onClick={() => chooseRoomname(room)}
									>
										Create
									</button>
									<div>
										{rooms.map((room) => (
											<div key={room.id}>
												<button
													className="roomsId"
													onClick={() => {
														setRoom(room.name);
														chooseRoomname(
															room.name
														);
													}}
												>
													{room.name}
												</button>
												<button
													onClick={() =>
														handleDelete(room.name)
													}
												>
													x
												</button>
											</div>
										))}
									</div>
								</div>
								<div className="sidebarUser">
									<p>USERS:</p>
									<div>
										{users &&
											users.map((user) => (
												<div key={user.id}>
													<button
														className="usersId"
														// onClick={() => {
														// 	setRoom(user.name);
														// 	chooseRoomname(
														// 		user.name
														// 	);
														// }}
													>
														{user.name}
													</button>
													<button
														onClick={() =>
															handleDeleteUser(
																user.name
															)
														}
													>
														x
													</button>
												</div>
											))}
									</div>
								</div>
							</div>

							<div className="chatLayout">
								<div className="chat">
									{messages.map((message) => (
										<div key={message.id}>
											<p className="userId">
												{message.user_name}:
											</p>
											<p className="message">
												{message.msg}
											</p>
											<p className="date">
												{dayjs(message.date).format(
													"YY-MM-DD HH:mm"
												)}
											</p>
										</div>
									))}
								</div>
								<div className="inputLayout">
									<input
										onChange={(e) =>
											setMessage(e.target.value)
										}
										className="chatInput"
										type="text"
										placeholder="Message"
									></input>
									<button
										onClick={() => handleMessage(message)}
										className="chatButton"
									>
										Send
									</button>
								</div>
								{/* <div className="inputLayout"></div> */}
							</div>
						</div>
					</div>
				</header>
			)}
		</div>
	);
}

export default App;
