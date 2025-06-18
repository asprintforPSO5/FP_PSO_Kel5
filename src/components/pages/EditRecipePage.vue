<template>
  <main>
    <div class="container-md my-5 py-5">
      <RecipeForm v-if="detailData && !isLoading" :isEdit="true" :detailData="detailData" />
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import RecipeForm from '../recipeForm/RecipeForm.vue';
  
const store = useStore();
const route = useRoute();

// Initialize detailData with an empty object and expected properties
// This ensures reactivity and a consistent structure for the child component
const detailData = ref({
  category: "",
  cookTime: 0,
  prepTime: 0,
  totalTime: 0,
  name: "",
  description: "",
  imageLink: "",
  username: "",
  // Add any other properties your recipe object might have
});

const isLoading = ref(false);

onMounted(async () => {
  isLoading.value = true;
  await store.dispatch("recipe/getRecipeDetail", route.params.id);
  console.log(store.state.recipe.recipeDetail);
  
  // Assign the fetched data to the value of the reactive reference
  // This will update the detailData object and trigger reactivity
  Object.assign(detailData.value, store.state.recipe.recipeDetail);

  isLoading.value = false;
});
</script>