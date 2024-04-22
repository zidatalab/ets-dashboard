function setColor() {
  const colors = [];
  const startHue = 200;
  const endHue = 300;
  const numColors = 11;
  const hueStep = (endHue - startHue) / (numColors - 1);

  for (let i = 0; i < numColors; i++) {
    const hue = startHue + i * hueStep;

    colors.push(`hsl(${hue}, 100%, 50%)`);
  }

  return colors
}

/**
 * Gets the color for a given data point and value based on color grades
 * 
 * @param data - The data to search 
 * @param value - The value to find the color for
 * @param colorGrade - The color grades to use for mapping values to colors
 * @returns The color as a string, or 'green' if no match is found
 */
export function getColor(data: any, value: any, colorGrade: any) {
  let gradeValue
  const dataValue = data.find((item: any) => item.angebot_group_plz4 === value.plz4)

  if (!dataValue) {
    return 'white'
  }

  if (dataValue) {
    gradeValue = colorGrade.find((item: any) => dataValue.angebot_Anzahl <= item.value || dataValue.angebot_Anzahl > colorGrade[colorGrade.length - 1].value)

    if (gradeValue.value > colorGrade[colorGrade.length - 1].value) {
      return colorGrade[colorGrade.length - 1].color
    }

    if (gradeValue) {
      return gradeValue.color
    }
  }
}

/**
 * Generates color grades for mapping data values 
 * 
 * This function takes in data with value properties and generates 
 * discrete color grades to map those values. It calculates min and max
 * values, number of grades, and assigns a color from the predefined 
 * palette to each grade.
 *
 * @param data - The data to generate grades for 
 * @returns An array of objects with value and color properties 
 * for each grade
*/
export function generateGrades(data: any) {
  const steps = []
  const values = data.map((item: any) => item.angebot_Anzahl);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const stepRange = rangeFinder(min, max)
  const step = ((max - min) / stepRange);
  const colors = setColor();
  let stepsWithColors = null

  if (min === Infinity || max === -Infinity) {
    return [{ value: 0, color: 'white' }]
  }

  if (values.length === 0) {
    return [{ value: 0, color: 'white' }]
  }

  if ((min === max)) {
    return [{ value: min, color: colors[min] }]
  }

  for (let i = min; i <= max; i += step) {
    steps.push(Number(i.toFixed(0)))
  }

  stepsWithColors = steps.map((step, index) => {
    return {
      value: step,
      color: colors[index]
    }
  })

  return stepsWithColors
}

function rangeFinder(min: number, max: number) {
  const range = max - min
  const numSteps = Math.ceil(range / 10)

  if(numSteps > 10) return 10

  return numSteps
}

/**
 * Processes map data by filtering for a given urgency level 
 * and grouping the results.
 * 
 * @param result - The raw map data 
 * @param levelSettings - The settings for the current urgency level
 * @returns The grouped and filtered results
*/
export function processMapData(result: any, levelSettings: any) {
  const innerResult = result[0]['stats_angebot']

  const filteredResult = getFilteredData(innerResult, levelSettings)

  const dateFilteredResult = groupDateFilter(filteredResult, levelSettings)

  return groupSum(dateFilteredResult)
}

/**
 * Filters the provided data based on the given filters
 * 
 * @param data - The data to filter and group
 * @param filters - The filters to apply when filtering the data
 * @returns The filtered and grouped data
*/
export function groupDateFilter(data: any, filters: any) {
  switch (filters.resolutionPlaningOption) {
    case 'yesterday':
      return data.filter((item: any) => item.angebot_reference_date === getYesterdaysDate())
    case 'today':
      return data.filter((item: any) => item.angebot_reference_date === getTodaysDate())
    case 'tomorrow':
      return data.filter((item: any) => item.angebot_reference_date === getTomorrrowsDate())
    case 'last4Weeks':
      return data.filter((item: any) => {
        const dateObject = getLast4Weeks()

        return new Date(item.angebot_reference_date) >= dateObject.toDate &&
          new Date(item.angebot_reference_date) <= dateObject.today;
      })
    case 'upcoming4Weeks':
      return data.filter((item: any) => {
        const dateObject = getUpcoming4Weeks()

        return new Date(item.angebot_reference_date) >= dateObject.today &&
          new Date(item.angebot_reference_date) <= dateObject.toDate
      })
    default:
      break;
  }
}

/**
 * Groups and sums data by a given property. 
 * 
 * Loops through the data and reduces it into an array of grouped objects. 
 * Each group object contains the sum of a value property as well as 
 * properties to identify the group.
 *
 * @param data - The data to group and sum
 * @returns An array of grouped objects
*/
export function groupSum(data: any) {
  const result: any = [];

  data.reduce(function (res: any, value: any) {
    if (!res[value.angebot_group_plz4]) {
      res[value.angebot_group_plz4] = {
        angebot_group_plz4: value.angebot_group_plz4,
        angebot_Anzahl: 0,
        angebot_group_dringlichkeit: value.angebot_group_dringlichkeit,
        angebot_group_status: value.angebot_group_status,
        angebot_reference_date: value.angebot_reference_date
      };

      result.push(res[value.angebot_group_plz4])
    }

    res[value.angebot_group_plz4].angebot_Anzahl += value.angebot_Anzahl;

    return res;
  }, {});

  return result
}

function getFilteredData(data: any, filters: any) {
  const result = data.filter((item: any) => {
    return item['angebot_group_dringlichkeit'] === filters['urgency'] && item['angebot_group_status'] === filters['status']
  })

  return result
}

function getYesterdaysDate() {
  const now = new Date();
  const result = new Date(now.setDate(now.getDate() - 1));

  return result.toISOString().slice(0, 10);
}

function getTodaysDate() {
  const now = new Date();

  return now.toISOString().slice(0, 10);
}

function getTomorrrowsDate() {
  const now = new Date();
  const result = new Date(now.setDate(now.getDate() + 1));

  return result.toISOString().slice(0, 10);
}

function getLast4Weeks() {
  const now = new Date();

  const today = now
  const toDate = new Date(new Date().setHours(-24 * 7 * 4));

  return { today: today, toDate: toDate }
}

function getUpcoming4Weeks() {
  const now = new Date();

  const today = now
  const toDate = new Date(new Date().setHours(24 * 7 * 4))

  return { today: today, toDate: toDate }
}
