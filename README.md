# Lamp Collection

A static catalogue of designer lamps: name, photos, features and story.

Initial entries come from Fatih Arslan's post [The lamps in my house](https://arslan.io/2026/10/05/the-lamps-in-my-house/). Photos are hotlinked from that post and belong to the author.

## Adding a lamp

Append an object to `data/lamps.json`. `images` are paths relative to `source.imageBase`; to use images from elsewhere, extend `img()` in `app.js`.

## Run locally

```sh
python3 -m http.server
```
