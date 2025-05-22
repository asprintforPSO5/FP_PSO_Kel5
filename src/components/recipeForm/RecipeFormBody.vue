<script setup>
    import BaseInput from '../ui/BaseInput.vue';
    import BaseSelect from '../ui/BaseSelect.vue';
    import BaseTextArea from '../ui/BaseTextArea.vue';
    import BaseButton from '../ui/BaseButton.vue';

    import { onMounted, reactive } from "vue";
    import { ref } from 'vue';
    import { useStore } from 'vuex';
    import { useRoute, useRouter } from 'vue-router';
    
    const store = useStore()
    const router = useRouter()
    const route = useRoute()

    const props = defineProps({
        isEdit: { type: Boolean, default: false },
        detailData: { type: Object },
    })

    const recipeData = reactive({
        imageLink: "",
        name: "",
        description: "",
        category: "",
        prepTime: 0,
        cookTime: 0,
        totalTime: 0,
        ingredients: [],
        directions: [],
    });

    onMounted(async () => {
        if (props.isEdit) {
            try {
                await store.dispatch("recipe/getRecipeDetail", route.params.id)
                recipeData.value = store.state.recipe.recipeDetail
                ingredientCount.value = recipeData.value.ingredients.length
                directionCount.value = recipeData.value.directions.length
            } catch (err) {
                console.log(err)
            } 
        }
    })
    


    const checkImage = (e) => {
        const file = e.target.files[0]
        const reader = new FileReader()
        reader.readAsDataURL(file)

        reader.addEventListener("load", () => {
            recipeData.imageLink = reader.result
        })
    }   

    const ingredientCount = ref(1)
    const directionCount = ref(1)

    const addIngredient = () => {
        ingredientCount.value++
    }

    const addDirection = () => {
        directionCount.value++
    }

    const deleteIngredient = (index) => {
        recipeData.ingredients.splice(index, 1)
        ingredientCount.value--
    }

    const deleteDirection = (index) => {
        recipeData.directions.splice(index, 1)
        directionCount.value--
    }

    const totalTime = () => {
        recipeData.totalTime = parseInt(recipeData.prepTime) + parseInt(recipeData.cookTime)
    }

    const addNewRecipe = async () => {
        if (props.isEdit){
            console.log(recipeData.value)
            await store.dispatch("recipe/updateRecipe", { id: route.params.id, newRecipe: recipeData })
        } else {
            await store.dispatch("recipe/addNewRecipe", recipeData)
        }
        router.push("/user/user-recipe")
    }

</script>

<template>
    <li class="list-group-item">
        <form @submit.prevent="addNewRecipe">
            <!-- General Information Start -->
            <div>
                <p class="my-3 fs-5 fw-semibold">General Information</p>
                <div>
                    <!-- Image Start -->
                    <div class="mb-3"> <!-- 1 --> 
                        <BaseInput 
                            type="file"
                            identity="recipeImage"
                            label="Photo Image"
                            @input="checkImage" />
                    </div>
                    <!-- Image End -->
                    
                    <!-- Recipe Title Start -->
                    <div class="mb-3"> <!-- 2 --> 
                        <BaseInput 
                            type="text"
                            identity="recipeTitle"
                            placeholder="Give a title to the recipe"
                            label="Recipe Title"
                            v-model="recipeData.name" />
                    </div>
                    <!-- Recipe Title  End -->
                    
                    <!-- Recipe Description Start -->
                    <div class="mb-3"> <!-- 3 -->
                        <BaseTextArea 
                            identity="recipeDescription"
                            label="Description"
                            placeholder="Share a story behind the recipe"
                            v-model="recipeData.description" />
                     </div>
                    <!-- Recipe Description End -->
                    
                    <!-- Recipe Cateogry Start -->
                    <div class="mb-3"> <!-- 4 --> 
                        <BaseSelect 
                        :data="['Breakfast', 'Lunch', 'Dinner', 'Meals', 'Snacks']"
                        v-model="recipeData.category" />
                    </div>
                    <!-- Recipe Category End -->
                </div>
            </div>
            <!-- General Information End -->
          
            <!-- Time Setting Start -->
            <div class="border-top py-1">
                <p class="my-3 fs-5 fw-semibold">Time Setting</p>
                <div>
                    <!-- Preparation Time Start -->
                    <div class="mb-3"> <!-- 5 --> 
                        <BaseInput
                        type="number"
                        identity="prepTime"
                        placeholder="0"
                        label="Prep Time"
                        v-model="recipeData.prepTime" />
                    </div>
                    <!-- Preparation Time End -->
                    
                    <!-- Cook Time Start -->
                    <div class="mb-3"> <!-- 6 --> 
                        <BaseInput
                        type="number"
                        identity="cookTime"
                        placeholder="0"
                        label="Cook Time"
                        v-model="recipeData.cookTime" />
                    </div>
                    <!-- Cook Time End -->
                    
                    <!-- Total Time Start -->
                    <div class="mb-3"> <!-- 7 -->
                        <BaseInput
                        type="number"
                        identity="totalTime"
                        placeholder="0"
                        label="Total Time"
                        v-model="recipeData.totalTime" 
                        @totalTimeFocus="totalTime" readonly="1"/>
                    </div>
                    <!-- Total Time End -->
                </div>
            </div>
            <!-- Time Setting End -->
          
            <!-- Ingredients Start -->
            <div class="border-top py-1">
                <p class="my-3 fs-5 fw-semibold">Ingredients</p>
                <p>
                    Enter one ingredient per line. Include the quantity (i.e. cups,
                    tablespoons) and any special preparation (i.e. sifted, softened,
                    chopped). Use optional headers to organize the different parts of the
                    recipe (i.e. Cake, Frosting, Dressing).
                </p>
                <div>
                    <div class="mb-3 row" v-for="count in ingredientCount" :key="count">
                        <!-- Ingredient Input Start -->
                        <div class="col-lg-11 col-11"> <!-- 8 --> 
                            <BaseInput
                                type="text"
                                identity="ingredient"
                                placeholder="Ex: 1 cup of sugar"
                                v-model="recipeData.ingredients[count - 1]" />
                        </div>
                        <!-- Ingredient Input End -->
                        <div
                            class="col-lg-1 col-1 col-form-label align-self-end delete-ingredient"
                            style="color: #cb3a31" v-if="ingredientCount > 1" @click="deleteIngredient(count - 1)">
                            <i class="fa-regular fa-trash-can px-1"></i>
                            <span class="d-none d-md-inline">Delete</span>
                        </div>
                    </div>
                </div>
                <!-- Add More Button Start -->
                <!-- 9 -->
                 <BaseButton class="new-ingredient-btn px-3 py-2 ty" type="button"
                 @clickButton="addIngredient">Add More</BaseButton>
                <!-- Add More Button End -->
            </div>
            <!-- Ingredients End -->
          
            <!-- Direction Start -->
            <div class="border-top my-3">
                <p class="my-3 fs-5 fw-semibold">Directions</p>
                <p>
                  Explain how to make your recipe, including oven temperatures, baking
                  or cooking times, and pan sizes, etc. Use optional headers to organize
                  the different parts of the recipe
                </p>
                <div>
                  <div class="mb-3 row" v-for="count in directionCount" :key="count">
                    <!-- Direction Input Start -->
                    <div class="col-lg-11 col-11"><!-- 10 -->
                        <BaseInput 
                        type="text"
                        identity="direction"
                        placeholder="Step 1: Preheat the oven to 350F"
                        v-model="recipeData.directions[count - 1]" />
                    </div>
                    <!-- Direction Input End -->
                        <div
                            class="col-lg-1 col-1 col-form-label align-self-end delete-ingredient"
                            style="color: #cb3a31" v-if="directionCount > 1" @click="deleteDirection(count - 1)">
                            <i class="fa-regular fa-trash-can px-1"></i>
                            <span class="d-none d-md-inline">Delete</span>
                        </div>
                  </div>
                </div>
                <!-- Add More Button Start -->
                <!-- 11 -->
                <BaseButton class="new-ingredient-btn px-3 py-2 ty" type="button"
                @clickButton="addDirection">Add More</BaseButton>
                <!-- Add More Button End -->
            </div>
            <!-- Direction End -->
          
            <!-- Form Button Start -->
            <div class="border-top py-3 d-flex my-4 justify-content-end">
                <!-- Cancel Button Start -->
                <!-- 12 -->
                <BaseButton class="cancel-btn px-3 py-2 ms-1">Cancel</BaseButton>
                <!-- Cancel Button End -->
                
                <!-- Submit Button Start -->
                <!-- 13 -->
                <BaseButton class="submit-recipe-btn px-3 py-2 ms-1">Submit</BaseButton>
                <!-- Submit Button End -->
            </div>
            <!-- Form Button End -->
        </form>
    </li>
</template>