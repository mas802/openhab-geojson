# openhab-geojson

# What is this?

This is a proof-of-concept to enhance openhab items with geojson data to produce a convention-over-configuration style interactive floorplan. 

It might be developed into a UI addon at some point if there is sufficient interest - upvote here: [https://github.com/mas802/openhab-geojson/issues/1].

# Getting started

## Prerequisites

- Openhab 3.0
- The Models view in openhab should be structured hieracical with a focus on Home / Floors / Rooms (the setup expects the root node to be called Home)
- The actionable items should have at least either an appropriate Category and/or Tags to make them work ("Light", "DimmableLight", "Temperature", "Blinds", "Heating", etc).
- There is a limit for one action per area, but you can always provide sub-areas at the lower level 
(e.g. each light in a room can have its own area and/or points).

## Place files in /etc/openhab/html/static/geo 

(or in any other folder under /static/ on the openhab system)

Example:
```
cd /etc/openhab/html/
git clone git@github.com:mas802/openhab-geojson.git geo 
```

## Create basic geojson shapes and points

- go to [https://geojson.io/] and create the main features of your home (Floors, Rooms)
- set the property item to the corresponding item in openhab
- optionally set the offset property if you have multiple Floors (this will allow to view the entire Home on one screen).

Example: Definition of and Location Item "5OG" (Fifth Floor) with an optional offset.
```
{
  "type": "FeatureCollection",
  "features": [
    {
      "name": "5OG",
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [ omitted
            ],
            [ omiited
            ],
            [ omittes
            ],
            [ omittes
            ]
          ]
        ]
      },
      "properties": {
        "item": "5OG",
        "offset": [
          0.00004,
          -0.000108
        ]
      }
    },
...
}
```

## Import setup

- go to /static/geo/importer.html
- copy and paste the whole geojson from [https://geojson.io/] in the text field
- make sure you have a user that can edit (details here)
- press the import button
- if anything goes wrong, there should be a copy of the previouse configuration on the console

Example: You should find a configuration similar to this on any item that you specified a area or point for. Go to "Ädd Metadata" in Openhab and select the custom namespace "geojson" to see this on any item.

```
value: importer
config:
  geometry:
    coordinates:
      - - - [omitted]
          - 
          [...]
    type: Polygon
  importinfo: 2022-06-12T07:22:35.606Z
```

## Enjoy

- go to /static/geo/index.html
- adjust setup if needed
- report issues on github

## Optional Configuration

On the root item in your Model that must be called "Home" you can set two global config properties.
To set this select the root node and click "Add Metadata" then enter geojson as the custom namespace.

- nav: an array of groups for the main navigation 
- modes: an array of modes for the main navigation 
- rotation: a rotation matrix
- set additional sets to be used by the Select category (experimental)

Example: This will create a navigation with 3 nodes, 2 modes and rotate the floorplan by 10 degrees.
```
value: " "
config:
  nav:
    - Home
    - 4OG
    - 5OG
  modes:
    - Light,DimmableLight
    - Temperature,Heating
  rotation:
    - 0
    - 0
    - -10
```

# Currently Supported Special Item Category Tyoes ((x) = trigger actions when clicked)

- Light (Tag:Light(a), DimmableLight(a), Luminance)
- Temperature (Temperature, SetPoint(a))
- Battery
- State (evrything else, e.g. Switch(a), Blinds, Door, Motion, ...)
- Select (Special category with predefined states from the Home config)

Hint if you tag a Switch as a Light it will be properly marked as such.

# References and inspirations

- [https://www.d3indepth.com/geographic/]
- [https://geojson.io/]
- [https://www.raywenderlich.com/12690970-indoor-maps-on-ios-advanced-mapkit]

# TODO / FIXME / KNOWN ISSUES

## Stretch Goals / Ideas

- supported types und category/tags should be further cleaned up, generalized, and extended
- url parameter more generic
- generic root node instead of Home (multiple root nodes?)
- make sure boundary/control pattern is followed cleanly
- make an app.js with modules/webcomponents?
- move to a more modern d3.js than v4 (support for old iPad)
- .reverse is tied to offset for importer
- convert to plugin
