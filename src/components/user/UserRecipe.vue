<script setup>
    import UserRecipeCard from './UserRecipeCard.vue';

    import { computed } from 'vue';
    import { useRouter } from 'vue-router';
    import { useStore } from 'vuex';

    const store = useStore()
    const router = useRouter()

    const recipes = computed(() => {
        const allRecipe = store.state.recipe.recipes
        const userId = store.state.auth.userLogin.userId

        return allRecipe.filter((recipe) => recipe.userId === userId)
    })

    const deleteRecipe = async (id) => {
        await store.dispatch("recipe/deleteRecipe", id)
    }
</script>

<template>
    <ul class="list-group">
        <li class="list-group-item">
            <div class="d-flex flex-sm-row flex-column justify-content-between align-items-sm-center">
                <div class="mb-3 mb-sm-0">
                    <p class="my-0 fs-4 fw-semibold">My Recipe</p>
                    <p class="my-0 text-secondary">Add your original recipe here</p>
                </div>
                <div>
                    <RouterLink to="/new-recipe" class="btn add-btn px-3 py-2 rounded-pill">
                        <i class="fa-solid fa-circle-plus pe-2"></i>Add Recipe
                    </RouterLink>
                </div>
            </div>
        </li>
        <li class="list-group-item">
            <p class="mt-2 mb-4 fs-5 fw-semibold">Recipe</p>
            <div class="row">
                <!-- User Recipe Card -->
                 <UserRecipeCard 
                    v-for="recipe in recipes"
                    :key="recipe.id"
                    :recipe="recipe"
                    :buttonName="['Delete', 'Edit']"
                    @btnRemove="deleteRecipe(recipe.id)" >
                    <p>{{  new Date(recipe.createdAt).toDateString() }}</p>
                 </UserRecipeCard>
            </div>
        </li>
    </ul>
</template>