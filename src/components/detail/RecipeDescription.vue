<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router'; // 1. Impor useRoute

const store = useStore();
const route = useRoute(); // 2. Dapatkan akses ke informasi route

// Computed property untuk mendapatkan detail resep dari store
const recipeDetail = computed(() => {
  return store.state.recipe.recipeDetail;
});

// 3. Computed property untuk mendapatkan userId yang sedang login
const userId = computed(() => store.state.auth.userLogin.userId);

// 4. Computed property untuk memeriksa apakah resep sudah difavoritkan
const isFavorited = computed(() => {
  const likes = recipeDetail.value.likes;
  if (userId.value && likes && Array.isArray(likes)) {
    return likes.includes(userId.value);
  }
  return false;
});

// 5. Fungsi untuk menangani klik pada tombol favorit
function handleToggleFavorite() {
  if (!userId.value) {
    alert("Silakan login untuk menambahkan favorit.");
    return;
  }
  // Memanggil action Vuex dengan ID resep dari parameter URL
  store.dispatch("recipe/toggleFavorite", route.params.id);
}
</script>

<template>
  <div class="my-2 p-4 d-flex flex-column-reverse flex-lg-row justify-content-between border border-secondary-sublet rounded">
    <div class="pe-lg-4">
      <h2>{{ recipeDetail.name }}</h2>
      <p>
        {{ recipeDetail.description }}
      </p>

      <div class="d-flex d-lg-none flex-column justify-content-between border border-primary rounded bg-color-detail">
        <div class="w-75 my-3 pb-3 mx-auto pe-lg-4 ps-lg-3 border-bottom border-primary">
          <p class="my-0">Preptime</p>
          <p class="my-0">{{ recipeDetail.prepTime }} Mins</p>
        </div>
        <div class="w-75 px-lg-4 pb-3 mx-auto border-bottom border-primary">
          <p class="my-0">Cooktime</p>
          <p class="my-0">{{ recipeDetail.cookTime }} Mins</p>
        </div>
        <div class="w-75 my-3 mx-auto ps-lg-4 pe-3">
          <p class="my-0">Total</p>
          <p class="my-0">{{ recipeDetail.totalTime }} Mins</p>
        </div>
      </div>

      <div class="d-none d-lg-flex flex-lg-row justify-content-between border border-primary rounded bg-color-detail">
        <div class="w-75 my-3 pb-3 mx-auto pe-lg-4 ps-lg-3 border-end border-primary">
          <p class="my-0">Preptime</p>
          <p class="my-0">{{ recipeDetail.prepTime }} Mins</p>
        </div>
        <div class="w-75 my-3 px-lg-4 mx-auto border-end border-primary">
          <p class="my-0">Cooktime</p>
          <p class="my-0">{{ recipeDetail.cookTime }} Mins</p>
        </div>
        <div class="w-75 my-3 mx-auto ps-lg-4 pe-3">
          <p class="my-0">Total</p>
          <p class="my-0">{{ recipeDetail.totalTime }} Mins</p>
        </div>
      </div>
      <p class="my-3">Recipe By {{ recipeDetail.username }}</p>

      <div>
        <button
          class="btn px-3 py-2 rounded-pill"
          :class="isFavorited ? 'fav-btn-2' : 'fav-btn'"
          @click="handleToggleFavorite"
        >
          <i class="pe-2" :class="isFavorited ? 'fas fa-heart' : 'far fa-heart'"></i>
          {{ isFavorited ? 'Remove from Favorite' : 'Add To Favorite' }}
        </button>
      </div>
    </div>
    <div class="ps-lg-4">
      <img :src="[recipeDetail.imageLink]" alt="Food" class="recipe__detail-img rounded mx-auto" style="object-fit: cover"/>
    </div>
  </div>
</template>