import compact from "lodash/compact";
import isArray from "lodash/isArray";
import {
  nameIncludes,
  isFavourite,
  canInclude,
  mustInclude,
  mustNotInclude,
  makeableFrom,
  inGlass,
  inCategory
} from "./filterRules";

/**
 * Apply a single filter to a set of cocktails
 * @param {*} cocktails
 * @param {*} filter
 */
export function applyFilter(cocktails, filter) {
  return cocktails.filter(cocktail => {
    const cocktailIngredients = compact(
      cocktail.ingredients.map(i => i.ingredient)
    );

    switch (filter.rule) {
      case "nameIncludes":
        return nameIncludes(cocktail.name, filter.text);
      case "mustNotInclude":
        return mustNotInclude(filter.ingredients, cocktailIngredients);
      case "makeableFrom":
        return makeableFrom(filter.ingredients, cocktailIngredients);
      case "canInclude":
        return canInclude(filter.ingredients, cocktailIngredients);
      case "mustInclude":
        return mustInclude(filter.ingredients, cocktailIngredients);
      case "inGlass":
        return inGlass(filter.glasses, cocktail);
      case "inCategory":
        return inCategory(filter.categories, cocktail);
      case "isFavourite":
        return isFavourite(filter.favourites, cocktail);
      default:
        return true;
    }
  });
}

/**
 * Apply multiple filters, one after the other
 * @param {*} cocktails
 * @param {*} filters
 */
export function applyFilters(cocktails, filters = []) {
  if (!isArray(filters)) filters = [filters];

  return compact(filters).reduce(
    (acc, filter) => [...applyFilter(acc, filter)],
    [...cocktails]
  );
}

// builds an array of filters based on the users current filter options.
// TODO: This should probably be in filter.utils.
export function filtersFromUserOptions(
  userFilterOptions,
  bar,
  nonVeganIngredients,
  favourites
) {
  const filters = [];

  if (userFilterOptions.nameFilter) {
    filters.push({
      rule: "nameIncludes",
      text: userFilterOptions.nameFilter
    });
  }

  // the option about whether to include all/some ingredients
  if (userFilterOptions.activeFilters.includes("byIngredient")) {
    filters.push({
      rule: userFilterOptions.ingredientsRule,
      ingredients: userFilterOptions.ingredients
    });
  }

  // the option as to whether to only show stuff that is makeable from the bar
  if (userFilterOptions.activeFilters.includes("barOnly"))
    filters.push({ rule: "makeableFrom", ingredients: bar });

  // the option as to whether to only show stuff that is makeable from the bar
  if (userFilterOptions.activeFilters.includes("veganOnly"))
    filters.push({ ingredients: nonVeganIngredients, rule: "mustNotInclude" });

  // the category option
  if (
    userFilterOptions.activeFilters.includes("byCategory") &&
    userFilterOptions.categories.length
  )
    filters.push({
      rule: "inCategory",
      categories: userFilterOptions.categories
    });

  if (userFilterOptions.activeFilters.includes("favouritesOnly")) {
    filters.push({ rule: "isFavourite", favourites });
  }
  // the glasses option
  if (
    userFilterOptions.activeFilters.includes("byGlass") &&
    userFilterOptions.glasses.length
  )
    filters.push({
      rule: "inGlass",
      glasses: userFilterOptions.glasses
    });

  return filters;
}
