<script setup>
    defineProps ({
        recipes: Array
    })
</script>

<template>
    <div class="recipe_list-recipe row">
        <div
            class="col-12 col-lg-3 col-sm-4 position-relative"
            style="padding-top: 12px; padding-bottom: 12px" v-for="recipe in recipes">
            <div class="card text-decoration-none" style="height: 398px; text-align: left">
                <RouterLink v-bind:to="'/recipe/' + recipe.id" style="text-decoration: none">
                    <img
                        v-bind:src=[recipe.imageLink]
                        class="card-img-top"
                        alt="Food"
                        height="240"
                        width="285"
                        style="object-fit: cover"/>
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
                class="position-absolute text-secondary bg-light px-2 py-1 rounded-circle top-0 end-0 m-4 like-icon">
                <i class="fas fa-heart"></i>
            </div>
        </div>
    </div>  
    
</template>