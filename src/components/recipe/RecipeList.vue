<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

// Mendefinisikan props yang diterima dari komponen induk
defineProps({
  recipes: Array
});

// Mengakses Vuex store
const store = useStore();

// Mengambil userId dari state auth untuk pengecekan
const userId = computed(() => store.state.auth.userLogin.userId);

// Fungsi untuk menangani klik pada ikon hati
function handleToggleFavorite(recipeId) {
  // Hanya jalankan jika pengguna sudah login
  if (!userId.value) {
    // Arahkan ke halaman login jika belum login
    // (Opsional, tapi praktik yang baik)
    alert("Silakan login untuk menambahkan favorit.");
    // Anda bisa juga menggunakan router.push('/login') jika setup router sudah ada
    return;
  }
  store.dispatch("recipe/toggleFavorite", recipeId);
}

// Fungsi untuk memeriksa apakah resep ini sudah difavoritkan oleh user
function isFavorited(recipe) {
  // Pastikan recipe.likes ada dan merupakan array sebelum memeriksa
  if (userId.value && recipe.likes && Array.isArray(recipe.likes)) {
    return recipe.likes.includes(userId.value);
  }
  return false;
}
</script>

<template>
  <div class="recipe_list-recipe row">
    <div
      class="col-12 col-lg-3 col-sm-4 position-relative"
      style="padding-top: 12px; padding-bottom: 12px"
      v-for="recipe in recipes"
      :key="recipe.id"
    >
      <div class="card text-decoration-none" style="height: 398px; text-align: left">
        <RouterLink :to="'/recipe/' + recipe.id" style="text-decoration: none">
          <img
            :src="recipe.imageLink"
            class="card-img-top"
            alt="Food"
            height="240"
            width="285"
            style="object-fit: cover"
          />
          <div class="card-body" style="color: #0a0a0a">
            <p class="mb-0">{{ recipe.category }}</p>
            <div class="h-50">
              <h4 class="fs-5 mb-0">{{ recipe.name }}</h4>
            </div>
            <p>Recipe By: {{ recipe.username }}</p>
          </div>
        </RouterLink>
      </div>

      <div
        class="position-absolute text-secondary bg-light px-2 py-1 rounded-circle top-0 end-0 m-4 like-icon"
        @click="handleToggleFavorite(recipe.id)"
        style="cursor: pointer;"
      >
        <i class="fas fa-heart" :class="{ 'text-danger': isFavorited(recipe) }"></i>
      </div>
    </div>
  </div>
</template>