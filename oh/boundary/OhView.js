function updateOHItems(modes) {
    modes.forEach(e => triggerUpdateState(e));
}

function handleClick(e, d) {
  let action = d.properties?.action
  let item = d.properties?.item

  switch (action) {
    case "Light":
      toggleLight(d.properties?.Light)
      break
    case "DimmableLight":
      // TODO poping up the dimmer on the main vie might also be nice
      window.location.href = 'dimmer.html?item=' + d.properties?.DimmableLight;
      break
    case "Blinds":
      toggleBlinds(d.properties?.Blinds)
      break
    case "Group":
      window.location.href = 'index.html?group=' + d.properties?.Group;
      break
  }
}

function triggerUpdateState(attr) {
        var ele = document.querySelectorAll('[data-'+attr+']');
        for (var i in ele) if (ele.hasOwnProperty(i)) {
            itemUpdateState(ele[i], attr);
        }
}

const itemUpdateState = async (ele, attr) => {
  switch (attr) {
    case "Temperature":
      itemTempState(ele, 'data-Temperature');
      break;
    default:
      itemLightState(ele, 'data-'+attr);
  }
}


const itemLightState = async (a, attr) => {
    let response, result;

    let label = a.getAttribute(attr);
    if (label!=null) {
      result = await ohItemInfo(label);

      a.setAttribute('data-value', result);
      cls = result

      try {
        value = +result.match(/([\d\.]+)/)[0]
      } catch(e) {
        value = -99
      }

      if (value != -99) {
        if (value > 0) { cls = "ON" } else { cls = "OFF"}
        a.setAttribute('style', 'fill: '+colorScaleLight(value))
      } else if (result === "ON") {
        a.setAttribute('style', 'fill: '+colorScaleLight(100))
      } else if (result === "OFF") {
        a.setAttribute('style', 'fill: '+colorScaleLight(0))
      } else {
        a.setAttribute('style', '')
      }

      a.setAttribute('class', cls);
    }
}

const itemTempState = async (a, attr) => {
    let response, result;

    let label = a.getAttribute(attr);
    if (label!=null) {
      result = await ohItemInfo(label);

      a.setAttribute('data-value', result);

      try {
        value = +result.match(/([\d\.]+)/)[0]
      } catch(e) {
        value = -99
      }

      if (value != -99) {
        a.setAttribute('style', 'fill: '+colorScaleTemp(value))
      } else {
        a.setAttribute('style', '')
      }

    }
}
