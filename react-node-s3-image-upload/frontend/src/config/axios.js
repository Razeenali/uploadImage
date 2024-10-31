import axios from 'axios';

const baseURL = process.env.REACT_APP_BACKEND_URL; // Updated to match the .env variable
const USER_ID = 123;

const axiosClient = axios.create({
  baseURL,
  headers: {
    'x-user-id': USER_ID,
  },
});

export default axiosClient;