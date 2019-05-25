import map from "lodash/map";

export function countIngredients(cocktails = []) {
  const counts = cocktails.reduce((acc, cocktail) => {
    cocktail.ingredients.forEach(({ ingredient }) => {
      acc[ingredient]
        ? (acc[ingredient] = acc[ingredient] + 1)
        : (acc[ingredient] = 1);
    });
    return acc;
  }, {});

  return map(counts, (count, name) => {
    return { count, name };
  }).sort((a, b) => a.count < b.count);
}
