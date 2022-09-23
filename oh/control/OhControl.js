/* OH SHARED */

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
  var geo = item.metadata?.geojson?.config?.geometry
  if (geo) {

    let coords = geo.coordinates
    let newoffset = item.metadata?.geojson?.config?.offset
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
    // FIXME, switch to category? or just iterate all
    var isLight = item.tags?.includes("Light")
    if (isLight) {
      currentarea.properties['Light'] = item.name
      currentarea.properties['action'] = "Light"
    }

    valuePrioOld = currentarea.properties.valueprio
    valuePrioNew = modes.split(",").indexOf(item.category)
    if (item.category && valuePrioNew>-1 && valuePrioNew<valuePrioOld) {
      currentarea.properties[item.category] = item.name
      currentarea.properties['value-type'] = item.category
      currentarea.properties['valueprio'] = valuePrioNew
    }
  }

  item.members?.forEach(function (i) {
    features = features.concat(flatArea(i,offset,currentarea));
  });

  return features;
}

const flatPoints = function(item,offset,currentpoint) {
  var features = [];

  var pnt = item.metadata?.geojson?.config?.point

  let newoffset = item.metadata?.geojson?.config?.offset
  if (offset) {
    if (newoffset) {
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
      }
    }

  }

  // FIXME this should be more generic
  if (currentpoint && modes.split(",").includes(item.category)) {

    clonepoint = JSON.parse(JSON.stringify(currentpoint))

    if (item.category) {
      clonepoint.properties[item.category] = item.name
      clonepoint.properties['value-type'] = item.category
    }

    if (item.category == "DimmableLight") {
      clonepoint.properties['action'] = "DimmableLight"
    } else if (item.tags?.includes("Light")) {
      clonepoint.properties['Light'] = item.name
      clonepoint.properties['action'] = "Light"
      clonepoint.properties['value-type'] = "Light"
    } else if (item.category == "Blinds") {
      clonepoint.properties['action'] = "Blinds"
    } else if (item.category == "Heating") {
      clonepoint.properties['action'] = "Heating"
    }

    features.push(clonepoint);
  }


  item.members?.forEach(function (i) {
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

const ohItemInfo = async (label) => {
    let response, result;

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
