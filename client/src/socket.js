import { io } from 'socket.io-client';

const URL = "http://localhost:5000"; // Update if deploying
const socket = io(URL);

export default socket;
