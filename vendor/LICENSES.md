# Third-party licenses

This demo vendors the following third-party assets so it can run offline from `file://`.

## Three.js

- File: `three.min.js`
- Version: r149
- License: MIT
- Copyright: 2010-2023 Three.js Authors
- Project: https://threejs.org/

```
MIT License

Copyright © 2010-2023 Three.js Authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

## Ma Shan Zheng (马善政毛笔字体)

- File: `ma-shan-zheng.woff2`
- License: SIL Open Font License, Version 1.1
- Source: Google Fonts
- Project: https://fonts.google.com/specimen/Ma+Shan+Zheng
- License text: https://openfontlicense.org/open-font-license-official-text/

The font is used for the large Chinese calligraphy on the day scene. It is
distributed under the SIL Open Font License, which permits use, modification
and redistribution as part of this project, provided the font is not sold by
itself and the license notice is retained.

## Great Vibes

- File: `great-vibes.woff2`
- License: SIL Open Font License, Version 1.1
- Source: Google Fonts
- Project: https://fonts.google.com/specimen/Great+Vibes
- License text: https://openfontlicense.org/open-font-license-official-text/

The font is used for the English script lettering on the day and night scenes.
It is distributed under the SIL Open Font License, Version 1.1.

## Generated assets

All other visuals in this demo are generated at runtime:

- The galaxy glaze, top sprinkles, flame, smoke and glow textures are drawn
  with Canvas 2D in `cake.js`.
- The star field, bokeh, meteors and halos are drawn with Canvas 2D in `fx.js`.
- The music-box ambience is synthesized with WebAudio in `sound.js`.

No third-party images, models or audio files are included.
