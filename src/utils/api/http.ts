import axios from "axios";
const http = axios.create({
	baseURL: import.meta.env.VITE_BASE_URL,
	timeout: 30000,
	headers: {
		Accept: "application/json",
		"Content-Type": "application/json",
	},
});

http.interceptors.request.use(
	(config) => {
		// const { token } = getAuthCredentials();
		const token = null;
		config.headers = {
			...config.headers,
			Authorization: `Bearer ${token}`,
		};
		return config;
	},
	(error) => {
		console.log(error);
		return Promise.reject(error);
	}
);

// Change response data/error here
http.interceptors.response.use(
	(response) => {
		console.log("response", response);
		return response;
	},
	(error) => {
		console.log(error);
		if (
			(error.response && error.response.status === 401) ||
			(error.response && error.response.status === 403)
		) {
			// Cookies.remove(AUTH_CRED);

		}
		return Promise.reject(error);
	}
);


export default http;