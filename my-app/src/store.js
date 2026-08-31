import { configureStore, createSlice } from '@reduxjs/toolkit'

export const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const recipes = [
  { id: 'idli-sambar', title: 'Idli & sambar', category: 'Breakfast', time: '30 min', servings: 4, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=900&q=85', ingredients: ['Idli rice', 'Urad dal', 'Toor dal', 'Tomato', 'Curry leaves'] },
  { id: 'masala-dosa', title: 'Masala dosa', category: 'Breakfast', time: '45 min', servings: 4, image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=85', ingredients: ['Dosa batter', 'Potato', 'Onion', 'Green chilli', 'Coriander'] },
  { id: 'lemon-rice', title: 'South Indian lemon rice', category: 'Lunch', time: '25 min', servings: 3, image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=900&q=85', ingredients: ['Rice', 'Lemon', 'Peanuts', 'Mustard seeds', 'Curry leaves'] },
  { id: 'sambar-rice', title: 'Sambar rice', category: 'Lunch', time: '40 min', servings: 4, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85', ingredients: ['Rice', 'Toor dal', 'Mixed vegetables', 'Tamarind', 'Sambar powder'] },
  { id: 'chettinad', title: 'Chettinad chicken', category: 'Dinner', time: '55 min', servings: 4, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=85', ingredients: ['Chicken', 'Coconut', 'Onion', 'Ginger', 'Chettinad spices'] },
  { id: 'rasam', title: 'Pepper rasam', category: 'Dinner', time: '25 min', servings: 4, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85', ingredients: ['Tomato', 'Tamarind', 'Pepper', 'Garlic', 'Coriander'] },
]

const plannerSlice = createSlice({
  name: 'planner',
  initialState: {
    plan: { Mon: ['idli-sambar'], Tue: ['lemon-rice'], Wed: [], Thu: ['chettinad'], Fri: [], Sat: ['masala-dosa'], Sun: [] },
    checkedIngredients: [],
  },
  reducers: {
    addMeal: (state, action) => {
      const { day, recipeId } = action.payload
      if (state.plan[day].length < 2) state.plan[day].push(recipeId)
    },
    removeMeal: (state, action) => {
      const { day, index } = action.payload
      state.plan[day].splice(index, 1)
    },
    toggleIngredient: (state, action) => {
      const ingredient = action.payload
      const index = state.checkedIngredients.indexOf(ingredient)
      if (index === -1) state.checkedIngredients.push(ingredient)
      else state.checkedIngredients.splice(index, 1)
    },
  },
})

export const { addMeal, removeMeal, toggleIngredient } = plannerSlice.actions
export const store = configureStore({ reducer: { planner: plannerSlice.reducer } })
