const getMainCategory = (id, categories) => {
  for (const category of categories) {
    if (category.id === id) {
      return category
    }
    if (category.subcategories?.length) {
      const categoryFound = getMainCategory(id, category.subcategories)
      if (categoryFound?.id === id) {
        return categoryFound
      }
    }
  }
  return null
}

const extractSubcategoriesId = (category, currentIds = []) => {
  if (!category) {
    return
  }
  if (!currentIds.includes(category?.id)) {
    currentIds.push(category.id)
  }
  if (category.subcategories?.length) {
    for (const subcategory of category.subcategories) {
      if (!currentIds.includes(subcategory.id)) {
        currentIds.push(subcategory.id)
      }
      if (subcategory.subcategories?.length) {
        currentIds = [...extractSubcategoriesId(subcategory, currentIds)]
      }
    }
  }
  return currentIds
}

const getSubCategories = (categoryId, categories) => {
  const subcategoriesid = extractSubcategoriesId(getMainCategory(categoryId, categories))
  return subcategoriesid
}

module.exports = getSubCategories
