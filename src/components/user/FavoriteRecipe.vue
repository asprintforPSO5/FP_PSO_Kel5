<script setup>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import RecipeList from '../recipe/RecipeList.vue'; // 1. Impor komponen RecipeList

const store = useStore();

// 2. Ambil data yang dibutuhkan dari Vuex store
const allRecipes = computed(() => store.state.recipe.recipes);
const userId = computed(() => store.state.auth.userLogin.userId);

// 3. Buat computed property untuk menyaring resep favorit
const favoriteRecipes = computed(() => {
  // Pastikan kita punya data resep dan userId sebelum menyaring
  if (!allRecipes.value || !userId.value) {
    return []; // Kembalikan array kosong jika data belum siap
  }

  // Filter resep berdasarkan array 'likes'
  return allRecipes.value.filter(recipe => {
    // Tampilkan resep jika 'likes' ada, berbentuk array, dan mengandung userId
    return recipe.likes && Array.isArray(recipe.likes) && recipe.likes.includes(userId.value);
  });
});

// 4. Pastikan data resep sudah diambil saat komponen dimuat
onMounted(() => {
  if (allRecipes.value.length === 0) {
    store.dispatch('recipe/getRecipeData');
  }
});
</script>

<template>
  <ul class="list-group">
    <li class="list-group-item">
      <div class="mb-3 mb-sm-0">
        <p class="my-0 fs-4 fw-semibold">Favorite Recipe</p>
        <p class="my-0 text-secondary">Save the recipe that you loved here</p>
      </div>
    </li>
    <li class="list-group-item">
      <p class="mt-2 mb-4 fs-5 fw-semibold">Recipe</p>
      
      <div v-if="favoriteRecipes.length > 0" class="row">
        <RecipeList :recipes="favoriteRecipes" />
      </div>
      
      <div v-else>
        <p>You have not favorited any recipes yet.</p>
      </div>
    </li>
  </ul>
</template>