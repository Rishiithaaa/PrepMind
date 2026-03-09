const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const apiFetch = async (endpoint: string, options: any = {}) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const isFormData = options.body instanceof FormData;
    const headers: any = {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...options.headers,
    };

    if (token && token !== "null" && token !== "undefined") {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${API_URL}${path}`;
    console.log(`apiFetch calling: ${url}`);

    const response = await fetch(url, {
        cache: 'no-store', // 👈 Prevent Next.js from caching these dynamic requests
        ...options,
        headers,
    });

    return response;
};
