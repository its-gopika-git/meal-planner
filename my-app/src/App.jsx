import { useMemo, useState } from 'react'
import { Provider, useDispatch, useSelector } from 'react-redux'
import { AccountCircle, Add, CalendarMonth, CheckCircle, Close, Groups, MoreVert, Search, ShoppingBasket, Timer } from '@mui/icons-material'
import { Alert, Box, Button, Chip, IconButton, InputAdornment, LinearProgress, Paper, Snackbar, Stack, TextField, Typography } from '@mui/material'
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers-pro'
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import { addMeal, days, recipes, removeMeal, store, toggleIngredient } from './store'
import './App.css'

const recipeById = Object.fromEntries(recipes.map((recipe) => [recipe.id, recipe]))
const categories = ['All', 'Breakfast', 'Lunch', 'Dinner']
dayjs.extend(isoWeek)

function Planner() {
  const dispatch = useDispatch()
  const { plan, checkedIngredients } = useSelector((state) => state.planner)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [draggedRecipe, setDraggedRecipe] = useState(null)
  const [selectedRange, setSelectedRange] = useState([dayjs('2024-05-13'), dayjs('2024-05-19')])
  const [notice, setNotice] = useState('')
  const [noticeSeverity, setNoticeSeverity] = useState('success')

  const filteredRecipes = useMemo(() => recipes.filter((recipe) => {
    const matchesCategory = category === 'All' || recipe.category === category
    const searchable = `${recipe.title} ${recipe.ingredients.join(' ')}`.toLowerCase()
    return matchesCategory && searchable.includes(query.toLowerCase())
  }), [category, query])

  const ingredients = useMemo(() => {
    const counts = {}
    Object.values(plan).flat().forEach((id) => recipeById[id].ingredients.forEach((ingredient) => { counts[ingredient] = (counts[ingredient] || 0) + 1 }))
    return Object.entries(counts)
  }, [plan])

  const placeMeal = (day, recipeId) => {
    if (!recipeId) {
      showNotice('Select or drag a dish first.', 'warning')
      return
    }
    if (plan[day].length >= 2) {
      showNotice(`${day} already has 2 dishes planned.`, 'warning')
      return
    }
    dispatch(addMeal({ day, recipeId }))
    showNotice(`${recipeById[recipeId].title} added to ${day}.`)
    setSelectedRecipe(null)
    setDraggedRecipe(null)
  }

  const showNotice = (message, severity = 'success') => {
    setNotice(message)
    setNoticeSeverity(severity)
    window.setTimeout(() => setNotice(''), 2400)
  }

  const copyList = () => {
    if (!ingredients.length) {
      showNotice('Add a dish to your week first.', 'warning')
      return
    }
    navigator.clipboard?.writeText(ingredients.map(([ingredient, count]) => `${ingredient}${count > 1 ? ` x${count}` : ''}`).join('\n'))
    showNotice('Ingredient list copied.')
  }

  const saveMenu = () => {
    const hasMeals = Object.values(plan).some((list) => list.length)
    if (!hasMeals) {
      showNotice('Add at least one dish before saving.', 'warning')
      return
    }
    showNotice('Weekly menu saved.')
  }

  const weekStart = (selectedRange[0] || selectedRange[1] || dayjs()).startOf('isoWeek')
  const weekEnd = weekStart.add(6, 'day')
  const weekLabel = `${weekStart.format('MMM D')}–${weekEnd.format('D, YYYY')}`
  const hasMeals = Object.values(plan).some((list) => list.length > 0)

  return (
    <Box className="app-shell">
      <Box component="header" className="topbar">
        <Stack direction="row" alignItems="center" gap={1.2}><Box className="brand-mark"><LeafMark /></Box><Typography className="brand-name">Ilai<Typography component="span" className="brand-dot">.</Typography></Typography></Stack>
        <Stack direction="row" alignItems="center" gap={0.4} className="account-group header-actions"><Typography className="user-name">Gopika</Typography><IconButton aria-label="Open account menu" className="account-button"><AccountCircle /></IconButton></Stack>
      </Box>

      <Box component="main" className="main-content">
        <Stack className="page-heading" direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2}>
          <Box><Typography variant="overline" className="eyebrow">Tamil Nadu kitchen · {weekLabel}</Typography><Typography variant="h1">Your week, served.</Typography><Typography className="subtitle">Plan comforting South Indian meals and shop with confidence.</Typography></Box>
        </Stack>

        <Box className="three-columns">
          <Paper className="section-panel week-panel" elevation={0}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" className="section-header"><Box><Typography variant="h2">This week</Typography><Typography variant="body2" className="section-caption">{selectedRecipe ? 'Choose a day for your dish.' : 'Add up to two dishes per day.'}</Typography></Box></Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center" className="week-picker-row panel-toolbar">
              <LocalizationProvider dateAdapter={AdapterDayjs}><DateRangePicker value={selectedRange} onChange={(newValue) => setSelectedRange(newValue)} format="DD MMM YYYY" slotProps={{ textField: { size: 'small', className: 'week-picker' } }} /></LocalizationProvider>
            </Stack>
            <Stack className="week-list">{days.map((day, index) => <Box key={day} className={`week-row ${selectedRecipe ? 'row-ready' : ''}`} onClick={() => selectedRecipe && placeMeal(day, selectedRecipe)} onDragOver={(event) => event.preventDefault()} onDrop={() => placeMeal(day, draggedRecipe || selectedRecipe)}><Box className="day-label"><Typography variant="caption">{day}</Typography><Typography className="date-number">{weekStart.add(index, 'day').format('D')}</Typography></Box><Stack className="day-meals" direction="row" gap={1}>{plan[day].map((id, mealIndex) => <MealCard key={`${id}-${mealIndex}`} recipe={recipeById[id]} onRemove={() => dispatch(removeMeal({ day, index: mealIndex }))} />)}{plan[day].length < 2 && <Box className="drop-zone"><Add fontSize="small" /><Typography variant="caption">{selectedRecipe ? 'Add dish' : 'Drop or select'}</Typography></Box>}</Stack></Box>)}</Stack>
            <Button style={{
                marginTop: '1.6rem',
            }} variant="contained" className="save-button ingredients-save-button" startIcon={<CheckCircle fontSize="small" />} onClick={saveMenu} disabled={!hasMeals}>Save menu</Button>
          </Paper>

          <Paper className="section-panel dishes-panel" elevation={0}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" className="section-header"><Box><Typography variant="h2">Tamil dishes</Typography><Typography variant="body2" className="section-caption">Made for your table — drag or add dishes for the week</Typography></Box>
            </Stack>
            <Box className="search-toolbar panel-toolbar"><TextField fullWidth size="small" placeholder="Search dishes or ingredients" value={query} onChange={(event) => setQuery(event.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} /></Box>
            <Stack direction="row" gap={1.6} className="filter-row">{categories.map((item) => <Chip key={item} label={item} size="small" onClick={() => setCategory(item)} className={category === item ? 'active-chip' : ''} variant={category === item ? 'filled' : 'outlined'} />)}</Stack>
            {selectedRecipe && <Box className="selection-note"><CheckCircle fontSize="small" /><Typography variant="body2">Select a day in This week to place {recipeById[selectedRecipe].title}.</Typography><IconButton size="small" aria-label="Cancel selection" onClick={() => setSelectedRecipe(null)}><Close fontSize="small" /></IconButton></Box>}
            <Stack gap={1.2} className="recipe-list">{filteredRecipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} selected={selectedRecipe === recipe.id} onDragStart={() => setDraggedRecipe(recipe.id)} onAdd={() => setSelectedRecipe(recipe.id)} />)}{!filteredRecipes.length && <Typography className="empty-search">No Tamil dishes match your search.</Typography>}</Stack>
          </Paper>

          <Box className="ingredients-column">
            <Paper className="section-panel ingredients-panel" elevation={0}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" className="section-header"><Box><Typography variant="h2">Ingredients</Typography><Typography variant="body2" className="section-caption">Auto-built from your menu</Typography></Box></Stack>
              <Box className="progress-wrap"><Stack direction="row" justifyContent="space-between"><Typography variant="caption">{checkedIngredients.length} of {ingredients.length} checked</Typography><Typography variant="caption">{ingredients.length ? 'Ready to shop' : 'Add a dish first'}</Typography></Stack><LinearProgress variant="determinate" value={ingredients.length ? checkedIngredients.length / ingredients.length * 100 : 0} /></Box>
              <Stack className="ingredient-list">{ingredients.map(([ingredient, count]) => { const checked = checkedIngredients.includes(ingredient); return <Stack key={ingredient} direction="row" justifyContent="space-between" alignItems="center" className="ingredient-row" onClick={() => dispatch(toggleIngredient(ingredient))}><Stack direction="row" alignItems="center" gap={1}><Box className={`check-box ${checked ? 'checked' : ''}`}>{checked && <CheckCircle fontSize="inherit" />}</Box><Typography className={checked ? 'checked-label' : ''}>{ingredient}</Typography></Stack><Typography variant="caption" className="quantity">{count > 1 ? `x${count}` : '1'}</Typography></Stack> })}{!ingredients.length && <Typography className="empty-ingredients">Your menu ingredients will appear here.</Typography>}</Stack>
              <Button fullWidth variant="outlined" className="copy-button" startIcon={<ShoppingBasket />} disabled={!ingredients.length} onClick={copyList}>Copy ingredient list</Button>
            </Paper>
          </Box>
        </Box>
      </Box>
      <Snackbar open={Boolean(notice)} autoHideDuration={2400} onClose={() => setNotice('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setNotice('')} severity={noticeSeverity} variant="filled" sx={{ width: '100%' }}>{notice}</Alert>
      </Snackbar>
    </Box>
  )
}

function LeafMark() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.5 3.6c-8.6.2-15.9 4.9-16.9 12.4-.6 4.5 2.2 7.4 6.5 6.8 8-1.1 12.4-8.7 12.4-16.4 0-1-.9-2.9-2-2.8z" fill="currentColor" />
      <path d="M19 5.5C13.5 8 8.8 12.4 6.4 18.4" stroke="var(--soft)" strokeWidth="1.1" strokeLinecap="round" opacity=".65" />
    </svg>
  )
}

function RecipeCard({ recipe, selected, onDragStart, onAdd }) {
  return <Paper className={`recipe-card ${selected ? 'recipe-card-selected' : ''}`} elevation={0} draggable onDragStart={onDragStart}><Box component="img" src={recipe.image} alt={recipe.title} className="recipe-image" /><Box className="recipe-info"><Chip label={recipe.category} size="small" className="category-chip" /><Typography className="recipe-title">{recipe.title}</Typography><Stack direction="row" gap={1.4} className="recipe-meta"><Typography component="span"><Timer fontSize="inherit" />{recipe.time}</Typography><Typography component="span"><Groups fontSize="inherit" />{recipe.servings}</Typography></Stack><Button size="small" startIcon={selected ? <CheckCircle fontSize="inherit" /> : <Add />} className="add-meal" onClick={onAdd}>{selected ? 'Selected · pick a day' : 'Add to week'}</Button></Box></Paper>
}

function MealCard({ recipe, onRemove }) {
  return <Paper className="meal-card" elevation={0}><Box component="img" src={recipe.image} alt="" /><Box className="meal-copy"><Typography variant="caption">{recipe.category}</Typography><Typography className="meal-title">{recipe.title}</Typography></Box><IconButton size="small" className="remove-meal" aria-label={`Remove ${recipe.title}`} onClick={(event) => { event.stopPropagation(); onRemove() }}><Close fontSize="inherit" /></IconButton></Paper>
}

export default function App() { return <Provider store={store}><Planner /></Provider> }
