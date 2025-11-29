// interface IUser {
//   userId: string;
//   displayName: string;

// }
const API_BASE_URL = "https://biserial-subattenuate-arie.ngrok-free.dev";
// const API_BASE_URL = "http://localhost:5500";
// const API_BASE_URL = "https://israel-ramose-premeditatingly.ngrok-free.dev"
interface LoginData {
  email: string;
}
interface OtpData {
  email: string;
  otp: string;
}

export const logIn = {
  SendOtp: async (loginData: LoginData) => {
    try {
      const { email } = loginData;
      const reqBody = {
        email: email,
      };
      const response = await fetch(`${API_BASE_URL}/auth/sendOTP`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
        body: JSON.stringify(reqBody),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.log("Loi", error);
    }
  },
  verifyOtp: async (otpData: OtpData) => {
    try {
      const { email, otp } = otpData;
      const reqBody = {
        email: email,
        otp: otp,
      };
      const response = await fetch(`${API_BASE_URL}/auth/verifyOTP`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
        body: JSON.stringify(reqBody),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const result = await response.json();
      return result
    } catch (error) {
      console.log("Loi", error);
    }
  },
  outsideLogin: async (appName: string) => {
    try {
      window.location.href = `${API_BASE_URL}/auth/${appName}`;
      // const response = await fetch(`${API_BASE_URL}/auth/${appName}`, {
      //   method: "GET",
      //   headers: {
      //     "Content-Type": "application/json",
      //     "ngrok-skip-browser-warning": "true",
      //     Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      //   },
      // });
      // if (!response.ok) {
      //   const errorText = await response.text();
      //   throw new Error(
      //     `HTTP error! status: ${response.status}, message: ${errorText}`
      //   );
      // }
      // console.log(response);
      // const result = await response.json();
      // console.log(result.redirect_url);
      // if (result && result.redirect_url) {
      // window.location.href = result.redirect_url;
      //   return;
      // } else {
      //   throw new Error("Missing redirect URL in response.");
      // }
    } catch (error) {
      console.log("Loi", error);
    }
  },
};

export type { LoginData, OtpData };
