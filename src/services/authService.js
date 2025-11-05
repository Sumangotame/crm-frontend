import API from "./api";
import { jwtDecode } from "jwt-decode";

export const login = async (username, password) => {
    const response = await API.post("auth/login", { username, password });
    localStorage.setItem("token", response.data.token);
     const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);

        // Optional: check if token expired
        const currentTime = Date.now() / 1000; // in seconds
        if (decoded.exp && decoded.exp < currentTime) {
            console.warn("Token expired");
            localStorage.removeItem("token");
            return null;
        }

        localStorage.setItem("userid",decoded.id)
        localStorage.setItem("username",decoded.sub)
        localStorage.setItem("role",decoded.role)// { id, email, role, ... }
        console.log(localStorage.getItem("userid"));
        console.log(localStorage.getItem("username"));
        console.log(decoded)
    } catch (error) {
        console.error("Invalid token:", error);
        return null;
    }
    return response.data;
}

export const register = async (first_name, last_name, username, email, password) => {
    const response = API.post("auth/register", { first_name, last_name, username, email, password });
    return response.data;
}

export const logout = () => localStorage.removeItem("token");
// export const getCurrentUser = () => {
//     const token = localStorage.getItem("token");
//     if (!token) return null;

//     try {
//         const decoded = jwtDecode(token);

//         // Optional: check if token expired
//         const currentTime = Date.now() / 1000; // in seconds
//         if (decoded.exp && decoded.exp < currentTime) {
//             console.warn("Token expired");
//             localStorage.removeItem("token");
//             return null;
//         }

//         return decoded; // { id, email, role, ... }

//     } catch (error) {
//         console.error("Invalid token:", error);
//         return null;
//     }
// };