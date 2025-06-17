import { describe, it, expect, vi, beforeEach } from 'vitest'
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
import auth from '../../../store/auth.js'
import { Store } from 'vuex'
import recipe from '../../../store/recipe'
import { store } from '../../../store/index.js'


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
vi.mock('vuex', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useStore: () => ({
      dispatch: dispatchMock,
      state: {
        recipe: {
          recipeDetail: mockRecipeDetail
        }
      }
    }),
    createStore: actual.createStore // tambahkan ini!
  }
})

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

vi.mock('axios', () => ({
  default: {
    post: vi.fn(() => Promise.resolve({ data: { idToken: 'token', expiresIn: '3600', localId: 'uid' } })),
    get: vi.fn(() => Promise.resolve({ data: { key1: { userId: 'uid', name: 'Test' } } }))
  }
}))
vi.mock('js-cookie', () => ({
  default: {
    set: vi.fn(),
    remove: vi.fn()
  }
}))

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

describe('auth.js', () => {
  let state
  beforeEach(() => {
    state = auth.state()
  })

  it('setToken mutation', () => {
    auth.mutations.setToken(state, { idToken: 'abc', expiresIn: 123 })
    expect(state.token).toBe('abc')
    expect(state.tokenExpirationDate).toBe(123)
  })

  it('setUserLogin mutation', () => {
    auth.mutations.setUserLogin(state, { userData: { name: 'A' }, loginStatus: true })
    expect(state.userLogin).toEqual({ name: 'A' })
    expect(state.isLogin).toBe(true)
  })

  it('setUserLogout mutation', () => {
    state.token = 'abc'
    state.userLogin = { name: 'A' }
    state.isLogin = true
    state.tokenExpirationDate = 123
    auth.mutations.setUserLogout(state)
    expect(state.token).toBe(null)
    expect(state.userLogin).toEqual({})
    expect(state.isLogin).toBe(false)
    expect(state.tokenExpirationDate).toBe(null)
  })

  it('getRegisterData action', async () => {
    const commit = vi.fn()
    const dispatch = vi.fn(() => Promise.resolve())
    await auth.actions.getRegisterData({ commit, dispatch }, { email: 'a', password: 'b', firstname: 'f', lastname: 'l', username: 'u', imageLink: 'img' })
    expect(commit).toHaveBeenCalledWith('setToken', expect.any(Object))
    expect(dispatch).toHaveBeenCalledWith('addNewUser', expect.any(Object))
  })

  it('addNewUser action', async () => {
    const commit = vi.fn()
    const stateObj = { token: 'tok' }
    await auth.actions.addNewUser({ commit, state: stateObj }, { userId: 'uid' })
    expect(commit).toHaveBeenCalledWith('setUserLogin', { userData: { userId: 'uid' }, loginStatus: true })
  })

  it('getLoginData action', async () => {
    const commit = vi.fn()
    const dispatch = vi.fn(() => Promise.resolve({ userId: 'uid' }))
    const result = await auth.actions.getLoginData({ commit, dispatch }, { email: 'a', password: 'b' })
    expect(commit).toHaveBeenCalledWith('setToken', expect.any(Object))
    expect(dispatch).toHaveBeenCalledWith('getUser', 'uid')
    expect(result).toEqual({ userId: 'uid' })
  })

  it('getUser action', async () => {
    const commit = vi.fn()
    const result = await auth.actions.getUser({ commit }, 'uid')
    expect(commit).toHaveBeenCalledWith('setUserLogin', expect.objectContaining({ loginStatus: true }))
    expect(result).toEqual(expect.objectContaining({ userId: 'uid' }))
  })
})

describe('store/index.js', () => {
  it('should create a Vuex store with recipe and auth modules', () => {
    expect(store).toBeInstanceOf(Store)
    expect(store.hasModule('recipe')).toBe(true)
    expect(store.hasModule('auth')).toBe(true)
  })

  it('should use the correct modules', () => {
    expect(store._modulesNamespaceMap['recipe/']._rawModule).toBe(recipe)
    expect(store._modulesNamespaceMap['auth/']._rawModule).toBe(auth)
  })
})

Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_FIREBASE_API_KEY_REGISTER: 'reg',
    VITE_FIREBASE_API_KEY_LOGIN: 'login'
  }
})