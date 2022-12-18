/* OH SHARED */

const smallr = 15;
const bigr = 20;

const features2Geojson = function(rootitem, offset) {
  let geoJson = {
    "type": "FeatureCollection",
    "features": []
  }
  geoJson.features = flatArea(rootitem, offset).concat(flatPoints(rootitem, offset))
  return geoJson
}

const area2Geojson = function(rootitem, offset) {
  let geoJson = {
    "type": "FeatureCollection",
    "features": []
  }
  geoJson.features = flatArea(rootitem, offset)
  return geoJson
}

const points2Geojson = function(rootitem, offset) {
  let geoJson = {
    "type": "FeatureCollection",
    "features": []
  }
  geoJson.features = flatPoints(rootitem, offset)
  return geoJson
}

const flatArea = function(item,offset,currentarea) {

  var features = [];
  if (item.metadata && item.metadata.geojson && item.metadata.geojson && item.metadata.geojson.config && item.metadata.geojson.config.geometry) {
    var geo = item.metadata.geojson.config.geometry

    let coords = geo.coordinates
    let newoffset = item.metadata.geojson.config.offset
    if (offset) {
      if (newoffset) {
        offset = newoffset;
      }

      // TODO currently reversal for clockwise shapes is tied to offest, this should be handled independently
      coords = [geo.coordinates[0].slice().reverse().map(e => {return [e[0]+offset[0],e[1]+offset[1]]})]
    }

    currentarea = {
      name: item.name,
      type: "Feature",
      geometry: {type: geo.type, coordinates: coords},
      properties: {
        item: item.name,
        valueprio: 99
      }}

    if (newoffset) {
      currentarea.properties['offset'] = newoffset
    }

    features.push(currentarea);
  }

  if (currentarea) {
    var category = item.category
    // FIXME, this probably should be more generic and not limited to light only
    var isLight = item.tags.includes("Light")
    if (isLight) {
      category = "Light"
      currentarea.properties['action'] = "Light"
    }

    valuePrioOld = currentarea.properties.valueprio
    valuePrioNew = modes.split(",").indexOf(category)
    if (category && valuePrioNew>-1 && valuePrioNew<valuePrioOld) {
      currentarea.properties[category] = item.name
      currentarea.properties['value-item'] = item.name
      currentarea.properties['value-type'] = category
      currentarea.properties['valueprio'] = valuePrioNew
    }
  }

  if (item.members) item.members.forEach(function (i) {
    features = features.concat(flatArea(i,offset,currentarea));
  });

  return features;
}

const flatPoints = function(item,offset,currentpoint) {
  var features = [];

  var pnt;
  if (item.metadata && item.metadata.geojson && item.metadata.geojson && item.metadata.geojson.config && item.metadata.geojson.config.point) {
    pnt = item.metadata.geojson.config.point
  }

  if (offset) {
    if (item.metadata && item.metadata.geojson && item.metadata.geojson && item.metadata.geojson.config && item.metadata.geojson.config.offset) {
      let newoffset = item.metadata.geojson.config.offset
      offset = newoffset;
    }
  }

  if (pnt) {
    let coords = pnt.coordinates
    if (offset) {
      coords = [coords[0]+offset[0],coords[1]+offset[1]]
    }

    currentpoint = {
      name: item.name,
      type: "Feature",
      geometry: {type: pnt.type, coordinates: coords},
      properties: {
        item: item.name,
        r: smallr,
      }
    }

  }

  var category = item.category
  // FIXME, is there a more elegant way to do this?
  var isLight = item.tags.includes("Light")
  if (isLight && category != "DimmableLight") {
    category = "Light"
  }

  if (currentpoint && modes.split(",").includes(category)) {

    clonepoint = JSON.parse(JSON.stringify(currentpoint))

    if (category) {
      clonepoint.properties[category] = item.name
      clonepoint.properties['value-type'] = category
    }

    // FIXME this should be more generic
    if (category == "DimmableLight") {
      clonepoint.properties['action'] = "DimmableLight"
      clonepoint.properties['r'] = bigr
    } else if (category == "Light") {
      clonepoint.properties['action'] = "Light"
      clonepoint.properties['r'] = bigr
    } else if (category == "Switch") {
      clonepoint.properties['action'] = "Switch"
      clonepoint.properties['r'] = bigr
    } else if (category == "Blinds") {
      clonepoint.properties['action'] = "Blinds"
      clonepoint.properties['r'] = bigr
    } else if (category == "Heating") {
      clonepoint.properties['action'] = "Heating"
      clonepoint.properties['r'] = bigr
    }

    features.push(clonepoint);
  }


  if (item.members) item.members.forEach(function (i) {
    features = features.concat(flatPoints(i,offset,currentpoint));
  });

  return features;
}

const toggleLight = async (label) => {
    let response, result;

    result = await ohItemInfo(label);

    if (result == "OFF" || result == "0") {
      ohItemCommand(label, "ON");
    } else {
      ohItemCommand(label, "OFF");
    }

    window.setTimeout(function() {
       updateOHItems(modes.split(','));
    }, 200);
}

const toggleBlinds = async (label) => {
    let response, result;

    result = await ohItemInfo(label);

    if (result == "UP" || result == "100") {
      ohItemCommand(label, "DOWN");
    } else {
      ohItemCommand(label, "UP");
    }

    window.setTimeout(function() {
       updateOHItems(modes.split(','));
    }, 200);
}

const ohItemInfo = async (label, date) => {
    let response, result;

    if (date) return ohItemHistoricInfo(label, date);

    try {
        response = await fetch('/rest/items/' + label + '/state', {
            method: 'GET'
        });
        result = await response.text();
    } catch (error) {
        console.log(error, 'Oh server is not available');
        return {"state": 'ERROR 1', "until": 0};
    }

    if (result==='NULL') {
      return {"state": 'ERROR 2', "until": 0};
    }
    return result;
}


const ohItemHistoricInfo = async (label, date) => {
    let response, result;

    if (!date) {
      date = new Date();
    }

    endDateStr = new Date(date.getTime()+60000).toISOString();
    startDateStr = date.toISOString();

    try {
        response = await fetch('/rest/persistence/items/' + label + "?page=0&pagelength=1&endtime="+endDateStr+"&starttime="+startDateStr, {
            method: 'GET'
        });
        resultText = await response.text();
        result = JSON.parse(resultText);
    } catch (error) {
        console.log(error, 'Oh server is not available');
        return {"state": 'ERROR 1', "until": 0};
    }

    if (result==='NULL') {
      return {"state": 'ERROR 2', "until": 0};
    }

    return result.data[0].state;
}


const ohItemCommand = async (label, val) => {
    let response, result;

    try {
        response = await fetch('/rest/items/' + label, {
            method: 'POST',
            body: val
        });
        result = await response.text();
    } catch (error) {
        console.log(error, 'Oh server is not available');
        return 500;
    }

    if (result==='NULL') {
      return 500;
    }
    return result;
}


const ohItemEditMetadata = async (username,password,label, space, val) => {
    let response, result;

    try {
        response = await fetch('/rest/items/' + label + '/metadata/' + space, {
            method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Basic ' + btoa(username + ":" + password)
                },
            body: val
        });
        result = await response.text();
    } catch (error) {
        console.log(error, 'Oh server is not available');
        return 500;
    }

    if (result==='NULL') {
      return 500;
    }
    return result;
}
