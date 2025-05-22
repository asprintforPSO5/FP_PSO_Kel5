<script setup>
    import BaseInput from '../ui/BaseInput.vue';
    import BaseButton from '../ui/BaseButton.vue';
    import { reactive, ref } from 'vue';
    import { useStore } from "vuex";
    import { useRouter } from "vue-router";
    
    const store = useStore()
    const router = useRouter()

    const signupData = reactive({
        firstname: "",
        lastname: "",
        username: "",
        email: "",
        password: "",
        confirmationPassword: "",
        isLogin: false,
        imageLink: "",
    })

    const passwordStatusDisplay = ref("none")

    const passwordCheck = () => {
        console.log(signupData)
        if (signupData.password.length < 8) {
            passwordStatusDisplay.value = "block"
        } else {
            passwordStatusDisplay.value = "none"
        }
    }

    const confirmPasswordDoesNotMatch = ref("none")
    const confirmPasswordMatch = ref("none")

    const confirmationPasswordCheck = () => {
        if (signupData.confirmationPassword === "") {
            confirmPasswordDoesNotMatch.value = "none"
            confirmPasswordMatch.value = "none"
            return;
        }
        if (signupData.password !== signupData.confirmationPassword) {
            confirmPasswordDoesNotMatch.value = "block"
            confirmPasswordMatch.value = "none"
            return
        }
        confirmPasswordDoesNotMatch.value = "none"
        confirmPasswordMatch.value = "block"
    }

    const checkImage = (e) => {
        const file = e.target.files[0]
        const reader = new FileReader()
        reader.readAsDataURL(file)

        reader.addEventListener("load", () => {
            signupData.imageLink = reader.result
        })
    }

    const register = async () => {
        if (signupData. password !== signupData.confirmationPassword || signupData. password.length < 8) {
                signupData. confirmationPassword = "";
                signupData. password = "";
                confirmPasswordDoesNotMacth. value = "none";
                confirmPasswordMacth. value = "none";
        } else {
            await store.dispatch("auth/getRegisterData", signupData)
            router.push("/")
        }
    };

</script>

<template>
    <div class="container-fluid py-5" style="background-color: #f5f5f5">
        <div style="background-color: #ffffff" class="p-5 m-auto signup-form">
            <div class="text-center">
                <img src="../../assets/images/Logo.png" alt="Logo" />
                <h2 class="mt-4">Create your account</h2>
                <p>Enter your details to use all the app features.</p>
            </div>
            <form class="mt-3" @submit.prevent="register">
                <div class="row">
                    <div class="col-md-6"><!-- Firstname -->
                        <BaseInput
                        type="text"
                        identity="firstname"
                        placeholder="Ex: Juan"
                        label="First Name"
                        v-model="signupData.firstname"/>
                    </div>
                    <div class="col-md-6"><!-- Lastname -->
                        <BaseInput
                        type="text"
                        identity="lastname"
                        placeholder="Ex: Carlos"
                        label="Last Name"
                        v-model="signupData.lastname"/>
                    </div>
                </div>
                <div class="my-4"><!-- Username -->
                    <BaseInput
                        type="text"
                        identity="username"
                        placeholder="Ex: timedoorstudent"
                        label="Username"
                        v-model="signupData.username"/>
                </div>
                <div class="my-4"><!-- Email -->
                    <BaseInput
                        type="email"
                        identity="email"
                        placeholder="Ex: student@timedoor.com"
                        label="Email"
                        v-model="signupData.email"/>
                </div>
                <div class="my-4"><!-- Password -->
                    <BaseInput
                        type="password"
                        identity="password"
                        placeholder="*********"
                        label="Password"
                        v-model="signupData.password" @keyInput="passwordCheck" />
                        <p class="text-danger mt-1 fw-medium"
                            style="font-size: 11px"
                            :style="{ display: passwordStatusDisplay }">
                            Password must be at least 8 characters
                        </p>
                </div>
                <div class="my-4"><!-- Confirm Password -->
                    <BaseInput
                        type="password"
                        identity="confirmPassword"
                        placeholder="*********"
                        label="Confirm Password"
                        v-model="signupData.confirmationPassword" @keyInput="confirmationPasswordCheck"/>
                        <p class="text-danger mt-1 fw-medium"
                            style="font-size: 11px"
                            :style="{ display: confirmPasswordDoesNotMatch }">
                            Password does not match
                        </p>
                        <p class="text-success mt-1 fw-medium"
                            style="font-size: 11px"
                            :style="{ display: confirmPasswordMatch }">
                            Password is matched
                        </p>
                </div>
                <div class="my-4">
                    <BaseInput type="file" identity="recipeImage"
                    label="Profile Photo" isImage=True @input="checkImage">
                    <div>
                        <div class="border p-1 mt-2 rounded-circle" >
                            <img :src="signupData.imageLink"
                            class="rounded-circle"
                            width="140" height="150" style="object-fit:
                            cover"/>
                        </div>
                        <div class="text-center"
                        style="transform: translateY(-24px)" >
                            <i class="fa-solid fa-camera fs-5 p-2
                            rounded-circle bg-white" ></i>
                        </div>
                    </div>
                </BaseInput>
                </div>
                <BaseButton class="login w-100 my-3">Register</BaseButton>
            </form>
            <div class="text-center mt-4">
              <p class="fw-semibold">
                Already have account?<span style="color: #4c4ddc">
                    <RouterLink to="/login" class="text-decoration-none"> Login</RouterLink></span>
              </p>
            </div>
        </div>
    </div>
</template>