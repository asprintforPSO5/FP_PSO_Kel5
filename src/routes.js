import HomePage from "./components/pages/HomePage.vue"
import LoginPage from "./components/pages/LoginPage.vue"
import SignupPage from "./components/pages/SignupPage.vue"
import DetailPage from "./components/pages/DetailPage.vue"
import UserPage from "./components/pages/UserPage.vue"
import NewRecipePage from "./components/pages/NewRecipePage.vue"
import EditRecipePage from "./components/pages/EditRecipePage.vue"

import Cookies from "js-cookie"
import { store } from "./store/index"

// 1. Ubah fungsi checkAuth menjadi fungsi async
const checkAuth = async () => {
    const jwtCookie = Cookies.get("jwt")
    const expirationDate = Cookies.get("tokenExpirationDate")
    const userId = Cookies.get("UID")

    if (jwtCookie) {
        if (new Date().getTime() < +expirationDate) {
            store.commit("auth/setToken", {
                idToken: jwtCookie,
                expiresIn: expirationDate,
            })
            // 2. Tambahkan 'await' di sini untuk menunggu proses getUser selesai
            await store.dispatch("auth/getUser", userId)
            return true
        } else {
            store.commit("auth/setUserLogout")
            return false
        }
    } else {
        return false
    }
}

export const routes = [
    {
        path: "/",
        name: "home",
        component: HomePage,
        // 3. Ubah 'beforeEnter' menjadi async dan await checkAuth
        beforeEnter: async (to, from, next) => {
            await checkAuth()
            next()
        }
    },
    { path: "/login", name: "login", component: LoginPage },
    { path: "/signup", name: "signup", component: SignupPage },
    { path: "/recipe/:id", name: "detailPage", component: DetailPage,
        // 4. Lakukan hal yang sama untuk rute yang memerlukan login
        beforeEnter: async (to, from, next) => {
            await checkAuth()
            next()
        }
    },
    {
        path: "/user/:component", name: "userPage", component: UserPage,
        beforeEnter: async (to, from, next) => {
            const isAuth = await checkAuth()
            isAuth ? next() : next({ name: "login" })
        }
    },
    {
        path: "/new-recipe", name: "newRecipePage", component: NewRecipePage,
        beforeEnter: async (to, from, next) => {
            const isAuth = await checkAuth()
            isAuth ? next() : next({ name: "login" })
        }
    },
    {
        path: "/edit-recipe/:id", name: "editRecipePage", component: EditRecipePage,
        beforeEnter: async (to, from, next) => {
            const isAuth = await checkAuth()
            isAuth ? next() : next({ name: "login" })
        }
    },
]