<script setup>
    import UserMenu from '../user/UserMenu.vue';
    import PersonalInfo from '../user/PersonalInfo.vue';
    import FavoriteRecipe from '../user/FavoriteRecipe.vue';
    import UserRecipe from '../user/UserRecipe.vue';
    
    import { useRoute } from 'vue-router';
    import { computed } from 'vue';

    const route = useRoute()

    const component = {
        "personal-info": PersonalInfo,
        "favorite-recipe": FavoriteRecipe,
        "user-recipe": UserRecipe,
    }
    const getRoute = computed(() => {
        return route.params.component
    })
</script>

<template>
    <div class="container-md my-5 py-5">
        <div class="row">
            <UserMenu @changeComponent="$router.push($event)"/>
            <div class="col-lg-9">
                <component :is="component[getRoute]" />
            </div>
        </div>
    </div>
</template>