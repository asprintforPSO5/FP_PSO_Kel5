import axios from "axios";

export default {
    namespaced: true,
    state() {
        return {
            recipes: [],
            recipeDetail: {},
        }
    },
    getters: {},
    mutations: {
        setRecipeData(state, payload) {
            state.recipes = payload
        },
        setRecipeDetail(state, payload) {
            state.recipeDetail = payload
        },
        setNewRecipe(state, payload) {
            state.recipes.push(payload)
        }
    },
    actions: {
        async getRecipeData({commit}) {
            try {
                const { data } = await axios.get(
                    "https://timedoorezra-default-rtdb.firebaseio.com/recipes.json")
                
                    const arr = []
                    for (let key in data) {
                        arr.push({id:key, ...data[key]})
                    }
                    commit("setRecipeData", arr)

            } catch (err) {
                console.log(err)
            }
        },
        async getRecipeDetail({commit}, payload) {
            try {
                const { data } = await axios.get(`https://timedoorezra-default-rtdb.firebaseio.com/recipes/${payload}.json`)

                commit("setRecipeDetail", data)
            } catch (err) {
                console.log(err)
            }
        },
        async addNewRecipe({commit, rootState}, payload){
            const newData = {
                ...payload,
                username: rootState.auth.userLogin.username,
                createdAt: Date.now(),
                likes: ["null"],
                userId: rootState.auth.userLogin.userId,
            }

            try {
                const { data } = await axios.post(
                    `https://timedoorezra-default-rtdb.firebaseio.com/recipes.json?auth=${rootState.auth.token}`, newData)

                commit("setNewRecipe", { id: data.name, ...newData})
            } catch (err) {
                console.log(err)
            }
        },

        async deleteRecipe({ dispatch, rootState}, payload) {
            try {
                const { data } = await axios.delete(
                    `https://timedoorezra-default-rtdb.firebaseio.com/recipes/${payload}.json?auth=${rootState.auth.token}`)
                
                await dispatch("getRecipeData")
            } catch (err) {
                console.log(err)
            }
        },

                async toggleFavorite({ rootState, dispatch }, recipeId) {
            // 1. Dapatkan userId dari pengguna yang sedang login
            const userId = rootState.auth.userLogin.userId;
            if (!userId) {
                console.error("User not logged in!");
                return; // Hentikan jika pengguna tidak login
            }

            // 2. Dapatkan data resep yang akan di-update dari Firebase
            const token = rootState.auth.token;
            const response = await axios.get(`https://timedoorezra-default-rtdb.firebaseio.com/recipes/${recipeId}.json?auth=${token}`);
            const recipeData = response.data;

            // 3. Inisialisasi 'likes' jika belum ada
            if (!recipeData.likes || recipeData.likes.includes("null")) {
                recipeData.likes = [];
            }

            // 4. Cek apakah user sudah pernah like, lalu tambahkan/hapus
            const userIndex = recipeData.likes.indexOf(userId);
            if (userIndex >= 0) {
                // Jika sudah ada, hapus (unlike)
                recipeData.likes.splice(userIndex, 1);
            } else {
                // Jika belum ada, tambahkan (like)
                recipeData.likes.push(userId);
            }

            // 5. Update data resep di Firebase dengan data 'likes' yang baru
            try {
                await axios.patch(
                    `https://timedoorezra-default-rtdb.firebaseio.com/recipes/${recipeId}.json?auth=${token}`,
                    { likes: recipeData.likes } // Kirim hanya field 'likes' yang di-update
                );

                // 6. Refresh data resep di state agar UI terupdate
                await dispatch("getRecipeDetail", recipeId);
                await dispatch("getRecipeData"); // Refresh juga daftar resep utama
            } catch (err) {
                console.error("Error updating favorite status:", err);
            }
        },


        async updateRecipe({ dispatch, rootState}, { id, newRecipe }) {
            try {
                const { data } = await axios.put(
                    `https://timedoorezra-default-rtdb.firebaseio.com/recipes/${id}.json?auth=${rootState.auth.token}`, newRecipe)
                
                await dispatch("getRecipeData")
            } catch (err) {
                console.log(err)
            }
        }
    },
}