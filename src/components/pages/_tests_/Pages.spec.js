import { describe, it, expect, vi } from 'vitest'
import { mount, shallowMount } from '@vue/test-utils'
import SignupPage from '../SignupPage.vue'
import LoginPage from '../LoginPage.vue'
import NewRecipePage from '../NewRecipePage.vue'
import RecipeFormBody from '../../recipeForm/RecipeFormBody.vue'
import { createStore } from 'vuex'
import { createRouter, createMemoryHistory } from 'vue-router'
import RecipeDescription from '../../detail/RecipeDescription.vue'
import RecipeDetail from '../../detail/RecipeDetail.vue'
import DetailPage from '../DetailPage.vue'
import EditRecipePage from '../EditRecipePage.vue'
import HomePage from '../HomePage.vue'
import UserPage from '../UserPage.vue'



// Mock child components
vi.mock('../../auth/WebSignup.vue', () => ({ default: { template: '<div>SignupForm</div>' } }))
vi.mock('../../auth/WebLogin.vue', () => ({ default: { template: '<div>LoginForm</div>' } }))
vi.mock('../NewRecipeForm.vue', () => ({ default: { template: '<form><input name="title" /><button type="submit">Submit</button></form>' } }))

// Mock useStore agar selalu mengembalikan objek dengan dispatch mock
const dispatchMock = vi.fn()
const mockRecipeDetail = {
  name: 'Nasi Goreng',
  description: 'Nasi goreng enak dan mudah dibuat.',
  prepTime: 10,
  cookTime: 15,
  totalTime: 25,
  username: 'Chef Budi',
  imageLink: 'https://example.com/nasgor.jpg'
}
vi.mock('vuex', () => ({
  useStore: () => ({
    dispatch: dispatchMock,
    state: {
      recipe: {
        recipeDetail: mockRecipeDetail
      }
    }
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

describe('RecipeDescription.vue', () => {
  it('renders recipe detail correctly', () => {
    const wrapper = shallowMount(RecipeDescription)
    expect(wrapper.text()).toContain(mockRecipeDetail.name)
    expect(wrapper.text()).toContain(mockRecipeDetail.description)
    expect(wrapper.text()).toContain(`${mockRecipeDetail.prepTime} Mins`)
    expect(wrapper.text()).toContain(`${mockRecipeDetail.cookTime} Mins`)
    expect(wrapper.text()).toContain(`${mockRecipeDetail.totalTime} Mins`)
    expect(wrapper.text()).toContain(`Recipe By ${mockRecipeDetail.username}`)
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe(mockRecipeDetail.imageLink)
  })
})

describe('RecipeDetail.vue', () => {
  it('renders child components', () => {
    const wrapper = mount(RecipeDetail, {
      global: {
        stubs: ['RecipeDescription', 'RecipeIngredients', 'RecipeDirections'],
        mocks: {
          $store: {
            dispatch: () => Promise.resolve(),
            state: { recipe: { recipeDetail: {} } }
          },
          $route: { params: { id: '1' } }
        }
      }
    })
    expect(wrapper.html()).toContain('recipe-description-stub')
    expect(wrapper.html()).toContain('recipe-ingredients-stub')
    expect(wrapper.html()).toContain('recipe-directions-stub')
  })
})

describe('DetailPage.vue', () => {
  it('renders RecipeDetail component', () => {
    const wrapper = mount(DetailPage, {
      global: {
        stubs: ['RecipeDetail']
      }
    })
    expect(wrapper.html()).toContain('recipe-detail-stub')
  })
})

describe('EditRecipePage.vue', () => {
  it('renders RecipeForm component when detailData exists and not loading', async () => {
    const wrapper = mount(EditRecipePage, {
      global: {
        stubs: ['RecipeForm'],
        mocks: {
          $store: {
            dispatch: () => Promise.resolve(),
            state: { recipe: { recipeDetail: { title: 'Test' } } }
          },
          $route: { params: { id: '1' } }
        }
      }
    })
    // Tunggu lifecycle onMounted selesai
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(wrapper.html()).toContain('recipe-form-stub')
  })
})

describe('HomePage.vue', () => {
  it('renders RecipeList component when recipeListStatus is true', async () => {
    const wrapper = mount(HomePage, {
      global: {
        stubs: ['RecipeList'],
        mocks: {
          $store: {
            dispatch: () => Promise.resolve(),
            state: { recipe: { recipes: [{ title: 'Test Recipe' }] } }
          }
        }
      }
    })
    // Tunggu lifecycle onMounted selesai
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(wrapper.html()).toContain('recipe-list-stub')
  })
})

describe('UserPage.vue', () => {
  it('renders UserMenu and dynamic component', () => {
    const wrapper = mount(UserPage, {
      global: {
        stubs: ['UserMenu', 'PersonalInfo', 'FavoriteRecipe', 'UserRecipe'],
        mocks: {
          $route: { params: { component: 'personal-info' } },
          $router: { push: () => {} }
        }
      }
    })
    expect(wrapper.html()).toContain('user-menu-stub')
    
  })
})