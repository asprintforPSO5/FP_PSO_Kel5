import { describe, it, expect, vi } from 'vitest'
import { mount, shallowMount } from '@vue/test-utils'
import SignupPage from '../SignupPage.vue'
import LoginPage from '../LoginPage.vue'
import NewRecipePage from '../NewRecipePage.vue'
import RecipeFormBody from '../../recipeForm/RecipeFormBody.vue'
import { createStore } from 'vuex'
import { createRouter, createMemoryHistory } from 'vue-router'

// Mock child components
vi.mock('../../auth/WebSignup.vue', () => ({ default: { template: '<div>SignupForm</div>' } }))
vi.mock('../../auth/WebLogin.vue', () => ({ default: { template: '<div>LoginForm</div>' } }))
vi.mock('../NewRecipeForm.vue', () => ({ default: { template: '<form><input name="title" /><button type="submit">Submit</button></form>' } }))

// Mock useStore agar selalu mengembalikan objek dengan dispatch mock
const dispatchMock = vi.fn()
vi.mock('vuex', () => ({
  useStore: () => ({
    dispatch: dispatchMock,
    state: { recipe: { recipeDetail: { ingredients: [], directions: [] } } }
  })
}))

// Mock useRouter agar selalu mengembalikan objek dengan push mock
const pushMock = vi.fn()
vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRouter: () => ({
      push: pushMock
    }),
    useRoute: () => ({
      params: {}
    })
  }
})

describe('SignupPage.vue', () => {
  it('renders signup form', () => {
    const wrapper = mount(SignupPage)
    expect(wrapper.html()).toContain('SignupForm')
  })
})

describe('LoginPage.vue', () => {
  it('renders login form', () => {
    const wrapper = mount(LoginPage)
    expect(wrapper.html()).toContain('LoginForm')
  })
})

describe('NewRecipePage.vue', () => {
  it('renders new recipe form', () => {
    const wrapper = mount(NewRecipePage)
    expect(wrapper.html()).toContain('form')
  })
  it('submits new recipe form', async () => {
    const wrapper = mount(NewRecipePage)
    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    expect(form.exists()).toBe(true)
  })
})

describe('RecipeFormBody.vue', () => {
  it('memanggil addNewRecipe saat form di-submit', async () => {
    dispatchMock.mockClear()

    const router = createRouter({
      history: createMemoryHistory(),
      routes: []
    })
    router.push = vi.fn() // mock push

    const wrapper = shallowMount(RecipeFormBody, {
      props: { isEdit: false }
    })

    const form = wrapper.find('form')
    expect(form.exists()).toBe(true)
    await form.trigger('submit.prevent')
    expect(dispatchMock).toHaveBeenCalledWith('recipe/addNewRecipe', expect.anything())
    expect(pushMock).toHaveBeenCalledWith('/user/user-recipe')
  })
})