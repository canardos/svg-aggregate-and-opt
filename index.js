const fs = require('fs');
const path = require('path');
const { optimize } = require('svgo');

const svgoSettings = {
    multipass: true,
    plugins: [
        { name: "preset-default", params: {
            overrides: {
                cleanupIDs: false
            }
        }},
        { name: "cleanupIDs", active: true, params: { preservePrefixes: ["0x"] }},
        { name: "removeAttrs", params: { attrs: '(fill|stroke|fill-opacity|stroke-width|width|height|version)'} },
        "removeXMLNS",
    ],
}

const getFileList = (srcDir) => {
    let entry
    const files = [];
    try {
        const dir = fs.opendirSync(srcDir)
        while ((entry = dir.readSync()) !== null) {
            files.push(`${srcDir}/${entry.name}`);
        }
        dir.closeSync();
    }
    catch (err) {
        console.error(`Error: Unable to list SVG files in '${srcDir}'`)
        throw err;
    }
    return files.filter(f => path.extname(f).toLowerCase() === ".svg");
}

const printUsage = () => {
    console.log(
`
Optimize SVGs and set viewBox
-----------------------------

Input : folder of SVGs
Output: HTML file that displays the SVGs, sets their viewBoxes, and provides
        a download link.

This is a simple NodeJS script to optimize a group of SVGs and set their
viewBox correctly. Optimization is done by this script (via SVGo), while the
viewBox setting is offloaded to the browser.

This is accomplished by writing an HTML file that includes:
- The SVGs inline.
- A script to set the viewBox (using the browser API method 'getBBox').
- A button to download the resulting SVG.

The individual SVGs are wrapped in an outer SVG with style 'display: none' and
have no xml tag, as they are intended to be added inline and included via the
'use' tag.

Usage
-----

node index.js SVG_SOURCE_DIR

e.g.:
> node index.js ./my-svgs

`);
}

if (process.argv.length != 3) {
    printUsage();
    process.exit();
}

// Build file list

try {
    const srcFolder = process.argv[2];
    const srcFiles = getFileList(srcFolder);

    // Process
    if (srcFiles.length == 0) {
        console.warn(`\nAn error occured or no files were found in folder '${srcFolder}'\n`);
        process.exit();
    }
    console.log(
        `Found ${srcFiles.length} SVG files in '${srcFolder}':` +
        `${srcFiles.reduce( (str,src) => `${str}\n${src}`, "")}`);
    console.log("Processing...");

    const svg = srcFiles.reduce( (str,src) =>
            str + optimize(fs.readFileSync(src), svgoSettings).data + "\n", "");

    const outputFile = "output.html";
    const svgHeader = `<svg id='svg' xmlns="http://www.w3.org/2000/svg" version="1.1">\n`;
    const svgFooter = `</svg>`;
    const output = `
    <!doctype html>
    <title>Calculate SVG Bounding Boxes</title>
    ${svgHeader}
    ${svg}
    ${svgFooter}
    <button id="download">Download</button>
    <div id="view"></div>
    <p id="output"><code></code></p>
    <script>
        // https://stackoverflow.com/a/30832210/1601122
        function browserDownload(data, filename, type) {
           var file = new Blob([data], {type: type});
           var url = URL.createObjectURL(file);
           // IE10+
           if (window.navigator.msSaveOrOpenBlob) {
               window.navigator.msSaveOrOpenBlob(file, filename);
               return;
           }
           var a = document.createElement("a");
           a.href = url;
           a.download = filename;
           document.body.appendChild(a);
           a.click();
           setTimeout(function() {
               document.body.removeChild(a);
               window.URL.revokeObjectURL(url);
           }, 0);
       }

        // Set viewBox or each child SVG
        const svg = document.getElementById("svg");
        [...svg.children].forEach(e => {
            const box = e.getBBox();
            e.setAttribute("viewBox", \`\${box.x} \${box.y} \${box.width} \${box.height}\`);
        });

        // Output SVG content as text
        console.log(svg.outerHTML);
        const escape = (html) => html.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') ;
        document.getElementById("output").innerHTML = escape(svg.outerHTML);
        svg.style.display = "none";

        // Display the SVGs
        const view = document.getElementById("view");
        [...svg.children].forEach(e => {
            const ltr = e.cloneNode(true);
            ltr.setAttribute("height", "80px");
            view.appendChild(ltr);
        });

        // Setup download
        document.getElementById("download").addEventListener("click", () => {
            browserDownload(
                svg.outerHTML,
                "letters.svg",
                'text/csv');
        });
    </script>
    `

    console.log(`Writing output HTML '${outputFile}'...`);
    fs.writeFileSync(outputFile, output);
    console.log("Done!");
}
catch (err) {
    console.error(err);
}



