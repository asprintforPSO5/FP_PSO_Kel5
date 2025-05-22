<script setup>
    import RecipeFormBody from './RecipeFormBody.vue';
    import RecipeFormHeader from './RecipeFormHeader.vue';

    const props = defineProps({
        isEdit: { type: Boolean, default: false },
        detailData: { type: Object },
    })
</script>

<template>
    <ul class="list-group">
        <RecipeFormHeader />
        <RecipeFormBody :isEdit="isEdit" :data="{detailData}"/>
    </ul>
</template>