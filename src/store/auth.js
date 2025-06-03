import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { getDatabase, ref, set, get } from "firebase/database"; // Asumsi Anda menggunakan Realtime Database
// import { getFirestore } from "firebase/firestore"; // Jika menggunakan Firestore
import Cookies from "js-cookie";

// --- BAGIAN INISIALISASI FIREBASE ---
// Konfigurasi Firebase proyek Anda (ambil dari variabel lingkungan)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL, // Hanya jika menggunakan Realtime Database
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, // Hanya jika menggunakan Storage
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, // Hanya jika menggunakan Messaging
  appId: import.meta.env.VITE_FIREBASE_APP_ID
  // measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID // Opsional untuk Google Analytics
};

// Inisialisasi Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Dapatkan instance layanan Firebase yang akan digunakan di dalam store ini atau diekspor
const auth = getAuth(firebaseApp);
const database = getDatabase(firebaseApp); // Jika Anda menggunakan Realtime Database
// const firestore = getFirestore(firebaseApp); // Jika Anda menggunakan Firestore

// Anda bisa juga mengekspor instance ini jika dibutuhkan di luar store,
// meskipun untuk auth dan database, action di store ini akan menanganinya.
// export { auth, database };
// --- AKHIR BAGIAN INISIALISASI FIREBASE ---

export default {
  namespaced: true,
  state() {
    return {
      token: Cookies.get("jwt") || null,
      tokenExpirationDate: Cookies.get("tokenExpirationDate") || null,
      userLogin: JSON.parse(Cookies.get("userData") || "{}"),
      isLogin: !!Cookies.get("jwt"),
      authReady: false,
    };
  },
  mutations: {
    setToken(state, { idToken, user }) {
      const expiresIn = new Date().getTime() + (user.stsTokenManager.expirationTime - new Date().getTime());
      state.token = idToken;
      state.tokenExpirationDate = expiresIn;
      Cookies.set("tokenExpirationDate", expiresIn.toString(), { expires: 7, secure: true, sameSite: 'Lax' });
      Cookies.set("jwt", idToken, { expires: 7, secure: true, sameSite: 'Lax' });
    },
    setUserLogin(state, { userData, loginStatus }) {
      state.userLogin = userData;
      state.isLogin = loginStatus;
      if (loginStatus && userData) {
        Cookies.set("userData", JSON.stringify(userData), { expires: 7, secure: true, sameSite: 'Lax' });
        Cookies.set("UID", userData.userId, { expires: 7, secure: true, sameSite: 'Lax' });
      } else {
        Cookies.remove("userData");
      }
    },
    setUserLogout(state) {
      state.token = null;
      state.userLogin = {};
      state.isLogin = false;
      state.tokenExpirationDate = null;
      Cookies.remove("jwt");
      Cookies.remove("tokenExpirationDate");
      Cookies.remove("UID");
      Cookies.remove("userData");
    },
    setAuthReady(state, payload) {
      state.authReady = payload;
    }
  },
  actions: {
    async listenToAuthChanges({ commit, dispatch }) {
      return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            const idToken = await user.getIdToken();
            commit("setToken", { idToken, user });
            const userProfile = await dispatch("getUserProfileData", user.uid);
            if (userProfile) {
              commit("setUserLogin", { userData: userProfile, loginStatus: true });
            } else {
              commit("setUserLogin", {
                userData: { userId: user.uid, email: user.email },
                loginStatus: true
              });
            }
          } else {
            commit("setUserLogout");
          }
          commit("setAuthReady", true);
          resolve(user);
        });
      });
    },

    async getRegisterData({ commit, dispatch }, payload) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth, // Menggunakan instance auth dari Firebase SDK
          payload.email,
          payload.password
        );
        const user = userCredential.user;
        const idToken = await user.getIdToken();

        commit("setToken", { idToken, user });

        const newUserData = {
          userId: user.uid,
          firstname: payload.firstname,
          lastname: payload.lastname,
          username: payload.username,
          email: user.email,
          imageLink: payload.imageLink || "",
        };

        await dispatch("addNewUserToDB", newUserData);
        commit("setUserLogin", { userData: newUserData, loginStatus: true });
        return newUserData;
      } catch (err) {
        console.error("Register error:", err.code, err.message);
        throw err;
      }
    },

    async addNewUserToDB({ state }, userData) { // state.token tidak lagi diperlukan untuk URL RTDB jika aturan keamanan benar
      try {
        const userRef = ref(database, `user/${userData.userId}`); // Menggunakan instance database dari Firebase SDK
        await set(userRef, userData);
        console.log("User profile added to Realtime Database");
      } catch (err) {
        console.error("Add user to DB error:", err.message);
        throw err;
      }
    },

    async getLoginData({ commit, dispatch }, payload) {
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth, // Menggunakan instance auth dari Firebase SDK
          payload.email,
          payload.password
        );
        const user = userCredential.user;
        const idToken = await user.getIdToken();

        commit("setToken", { idToken, user });

        const userProfile = await dispatch("getUserProfileData", user.uid);
        if (userProfile) {
          commit("setUserLogin", { userData: userProfile, loginStatus: true });
          return userProfile;
        } else {
          console.error("User logged in but profile not found in DB.");
          commit("setUserLogin", {
            userData: { userId: user.uid, email: user.email },
            loginStatus: true
          });
          return { userId: user.uid, email: user.email };
        }
      } catch (err) {
        console.error("Login error:", err.code, err.message);
        throw err;
      }
    },

    async getUserProfileData(_, userId) {
      try {
        const userRef = ref(database, `user/${userId}`); // Menggunakan instance database dari Firebase SDK
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          return snapshot.val();
        } else {
          console.log("User profile not found in DB for UID:", userId);
          return null;
        }
      } catch (err) {
        console.error("Get user profile from DB error:", err.message);
        throw err;
      }
    },

    async logout({ commit }) {
      try {
        await signOut(auth); // Menggunakan instance auth dari Firebase SDK
        commit("setUserLogout");
      } catch (err) {
        console.error("Logout error:", err.message);
      }
    },
  },
  getters: {
    isAuthenticated(state) {
      return state.isLogin && !!state.token;
    },
    currentUser(state) {
      return state.userLogin;
    },
    isAuthReady(state) {
      return state.authReady;
    }
  }
};
