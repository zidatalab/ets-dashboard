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

export function getColor(data : any, value : any, colorGrade : any) {
  let gradeValue
  const dataValue = data.find((item : any) => item.angebot_group_plz4 === value.plz4)

  if (dataValue) {
    gradeValue = colorGrade.find((item : any) => dataValue.angebot_Anzahl <= item.value)

    if (!gradeValue) {
      return 'green'
    }

    if (gradeValue) {
      return gradeValue.color
    }
  }
}

export function generateGrades(data: any) {
  const steps = []
  const values = data.map((item: any) => item.angebot_Anzahl);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const step = ((max - min) / 10);
  const colors = setColor();

  for (let i = min; i <= max; i += step) {
    steps.push(Number(i.toFixed(0)))
  }

  const stepsWithColors = steps.map((step, index) => {
    return {
      value: step,
      color: colors[index]
    }
  })

  return stepsWithColors
}

export function processMapData(result: any, levelSettings: any) {
  // Process result data
  const innerResult = result[0]['stats_angebot']
  const filteredResult = innerResult.filter((item: any) => {
    return item['angebot_group_dringlichkeit'] === levelSettings['urgency']
  })

  return groupSum(filteredResult)
}

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