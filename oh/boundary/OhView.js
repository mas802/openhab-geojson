function handleClick(d) {
  let action = d.properties.action
  let item = d.properties[d.properties['value-type']]

  // log the lat long coordinates of the coursor for info TODO correct for circles
  // coords = projection.invert(d3.pointer(e));
  // console.info(["clicked on: ", coords]);

  switch (action) {
    case "Toggle":
    case "Light":
      toggleLight(item)
      break
    case "Dimmer":
      // TODO poping up the dimmer on the main vie might also be nice
      window.location.href = 'dimmer.html?item=' + item;
      break
    case "HeatingDimmer":
      // TODO poping up the dimmer on the main vie might also be nice
      window.location.href = 'Heating.html?item=' + item;
      break
    case "Select": // rename / use player?
      // TODO poping up the dimmer on the main vie might also be nice
      window.location.href = 'Select.html?item=' + item;
      break
    case "BlindsToggle":
      toggleBlinds(item)
      break
    case "Group":
      window.location.href = 'index.html?group=' + item;
      break
    default:
      window.location.href = '/analyzer/?items=' + item;
  }
}

function updateOHItems(modes, date) {
    modes.forEach(e => triggerUpdateState(e, date));
}

function triggerUpdateState(attr, date) {
        var ele = document.querySelectorAll('[data-value-type="'+attr+'"]');
        for (var i in ele) if (ele.hasOwnProperty(i)) {
            itemUpdateState(ele[i], attr, date);
        }
}

const itemUpdateState = async (ele, attr, date) => {
  switch (attr) {
    case "Heating":
    case "Temperature":
      itemTempState(ele, 'data-'+attr, date);
      break;
    case "Battery":
      itemBatteryState(ele, 'data-'+attr, date);
      break;
    case "DimmableLight":
    case "Luminance":
    case "Light":
      itemLightState(ele, 'data-'+attr, date);
      break;
    case "Select":
      itemStateSelect(ele, 'data-'+attr, date, "♫");
      break;
    default:
      itemState(ele, 'data-'+attr, date);
  }
}


const itemStateSelect = async (a, attr, date, char) => {

    let label = a.getAttribute(attr);
    if (label!=null) {
      result = await ohItemInfo(label, date);

      a.setAttribute('data-value', result);

      let icon = a.getAttribute('data-icon');
      setLabelText(label, icon);
      if (result === "OFF" || (result && result.state)) {
        a.setAttribute('style', 'fill: '+colorScaleState(0))
      } else {
        a.setAttribute('style', 'fill: '+colorScaleState(100))
      }
    }
}

const itemState = async (a, attr, date) => {
    let response, result;

    let label = a.getAttribute(attr);
    if (label!=null) {
      result = await ohItemInfo(label, date);

      a.setAttribute('data-value', result);
      cls = result

      try {
        value = +result.match(/([-]?[\d\.]+)/)[0]
      } catch(e) {
        value = -99
      }

      if (value != -99) {
        if (value > 0) { cls = "ON" } else { cls = "OFF"}
        a.setAttribute('style', 'fill: '+colorScaleState(value))
        setLabelText(label, Math.round(value));
      } else if (result === "ON" || result === "OPEN") {
        a.setAttribute('style', 'fill: '+colorScaleState(100))
        setLabelText(label, "|");
      } else if (result === "OFF" || result === 'CLOSED') {
        a.setAttribute('style', 'fill: '+colorScaleState(0))
        setLabelText(label, "◯");
      } else {
        a.setAttribute('style', '')
        cls = "ERROR"
      }

      a.setAttribute('class', cls);
    }
}

const itemLightState = async (a, attr, date) => {
    let response, result;

    let label = a.getAttribute(attr);
    if (label!=null) {
      result = await ohItemInfo(label, date);

      a.setAttribute('data-value', result);
      cls = result

      try {
        value = +result.match(/([-]?[\d\.]+)/)[0]
      } catch(e) {
        value = -99
      }

      if (value > 0) {
        if (value > 0) { cls = "ON" } else { cls = "OFF"}
        a.setAttribute('style', 'fill: '+colorScaleLight(value))
        setLabelText(label, Math.round(value));
      } else if (result === "ON") {
        a.setAttribute('style', 'fill: '+colorScaleLight(100))
        setLabelText(label, "|");
      } else if (value == 0 || result === "OFF") {
        a.setAttribute('style', 'fill: '+colorScaleLight(0))
        setLabelText(label, "◯");
      } else {
        a.setAttribute('style', '')
        cls = "ERROR"
      }

      a.setAttribute('class', cls);
    }
}

const itemTempState = async (a, attr, date) => {
    let response, result;

    let label = a.getAttribute(attr);
    if (label!=null) {
      result = await ohItemInfo(label, date);

      a.setAttribute('data-value', result);

      try {
        value = +result.match(/([-]?[\d\.]+)/)[0]
      } catch(e) {
        value = -99
      }

      if (value != -99) {
        a.setAttribute('style', 'fill: '+colorScaleTemp(value))
        setLabelText(label, Math.round(10*value)/10);
      } else {
        a.setAttribute('style', '')
        a.setAttribute('class', 'ERROR');
      }

    }
}

const itemBatteryState = async (a, attr, date) => {
    let response, result;

    let label = a.getAttribute(attr);
    if (label!=null) {
      result = await ohItemInfo(label, date);

      a.setAttribute('data-value', result);

      try {
        value = +result.match(/([-]?[\d\.]+)/)[0]
      } catch(e) {
        value = -99
      }

      if (value != -99) {
        a.setAttribute('style', 'fill: '+colorScaleBattery(value))
        setLabelText(label, Math.round(value));
      } else {
        a.setAttribute('style', '')
        a.setAttribute('class', 'ERROR');
      }

    }
}

const setLabelText = async (label, value) => {
  text = document.getElementById("label-"+label);
  if (text) {
      text.innerHTML = value;
  }
}

const setLabelTitle = async (label, value) => {
  title = document.getElementById("title-"+label);
  if (title) {
    title.innerHTML = label + " " +value;
  }
}
