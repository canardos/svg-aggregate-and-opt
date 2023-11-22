# This is a simple NodeJS script to optimize a group of SVGs, set their viewBox correctly, and aggregate them into a single parent SVG for use inline.

**Note: This project was built to produce inline SVG letters for dynamic SVG playing card generation at [SolitaireCat.com](https://www.solitairecat.com) and is probably not useful in other applications.**

Optimization is performed by this script (via [`SVGo`](https://github.com/svg/svgo)), while the viewBox setting is offloaded to the browser due to the availability of the [`getBBox`](https://developer.mozilla.org/en-US/docs/Web/API/SVGGraphicsElement/getBBox) browser API method. The browser offload is accomplished by writing an HTML file that includes:

- The SVGs as inline elements.
- A script to set the viewBox (using the browser API method `getBBox`).
- A button to download the resulting SVG.

The individual SVGs are wrapped in an outer SVG with style `display: none` and have no xml tag, as they are intended to be added inline and included via the `use` tag.

The script is intended to be used in conjunction with the `example4` utility from this [`font-to-svg` fork](https://github.com/canardos/font_to_svg), to produce a set of optimized inline SVG letters from a TTF font. These SVG files can then be processed by this script as follows:

## Usage

```
node index.js SVG_SOURCE_DIR
```

**e.g.:**

```
> node index.js ./my-svgs
> firefox output.html

// click download
```

## Example SVG input/output

**Source file for characters `J` and `7` produced from a TTF file using [ttf-to-svg fork](https://github.com/canardos/font_to_svg):**

```<svg id='0x004a' width='2320px' height='2320px' xmlns='http://www.w3.org/2000/svg' version='1.1'>

  <!-- draw actual outline using lines and Bezier curves-->
  <path fill='black' stroke='black' fill-opacity='0.45'  stroke-width='2'  d='
    M -47,344
    Q 39,336 95,294
    Q 152,252 181,154
    Q 211,57 211,-111
    L 211,-1233
    Q 211,-1311 199,-1345
    Q 188,-1380 156,-1392
    Q 125,-1405 57,-1409
    L 57,-1450
    L 690,-1450
    L 690,-1409
    Q 621,-1405 590,-1392
    Q 559,-1380 548,-1345
    Q 537,-1311 537,-1233
    L 537,-483
    L 537,-358
    Q 537,-70 502,51
    Q 459,201 318,293
    Q 178,385 -47,385
    L -47,344
    Z
  '/>
</svg>
```

```
<svg id='0x0037' width='2320px' height='2320px' xmlns='http://www.w3.org/2000/svg' version='1.1'>

  <!-- draw actual outline using lines and Bezier curves-->
  <path fill='black' stroke='black' fill-opacity='0.45'  stroke-width='2'  d='
 M 1040,-1407
 Q 881,-1174 793,-1012
 Q 705,-850 655,-672
 Q 606,-494 608,-274
 Q 608,-240 612,-186
 Q 616,-137 616,-115
 Q 616,-51 578,-11
 Q 541,29 465,29
 Q 391,29 354,-14
 Q 317,-57 317,-123
 Q 317,-295 397,-482
 Q 477,-670 591,-838
 Q 705,-1006 868,-1214
 L 281,-1214
 Q 197,-1214 157,-1178
 Q 117,-1143 106,-1055
 L 59,-1055
 Q 66,-1120 66,-1221
 Q 66,-1321 51,-1450
 L 1040,-1450
 L 1040,-1407
 Z

  '/>
</svg>
```

**Resulting optimized SVG with correct viewBox (601 -> 259 bytes):**

```
<svg id="svg" xmlns="http://www.w3.org/2000/svg" version="1.1" style="display: none;">

<svg id="0x004a"><path d="M-47 344q86-8 142-50 57-42 86-140 30-97 30-265v-1122q0-78-12-112-11-35-43-47-31-13-99-17v-41h633v41q-69 4-100 17-31 12-42 47-11 34-11 112v875q0 288-35 409-43 150-184 242-140 92-365 92v-41Z"/></svg>

<svg id="0x0037"><path d="M1040-1407q-159 233-247 395T655-672q-49 178-47 398 0 34 4 88 4 49 4 71 0 64-38 104-37 40-113 40-74 0-111-43t-37-109q0-172 80-359 80-188 194-356t277-376H281q-84 0-124 36-40 35-51 123H59q7-65 7-166 0-100-15-229h989v43Z"/></svg>

</svg>

```
