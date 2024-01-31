let bytes = new Uint8Array();

function toggleTheme(checked) {
    if (checked) {
        document.body.classList.add("dark");
    } else {
        document.body.classList.remove("dark");
    }
}

function search(hex) {
    var styleId = "search-style";
    let style = document.getElementById(styleId);
    let text = "div.clr-field {display: none;} div.clr-field:has(input.coloris[pattern*=\"" + hex.toLowerCase() + "\"]) {display: block;}";

    if (!style) {
        style = document.createElement("style");
        style.id = styleId;
        style.innerText = text;
        document.head.appendChild(style);
    } else {
        if (hex) {
            style.innerText = text;
        } else {
            style.remove();
        }
    }
}

function addColor(zip, color, pos) {
    document.getElementById("load").style.display = "none";
    document.getElementById("drop").style.overflow = "auto";
    document.getElementById("search").style.display = "block";
    var list = document.getElementById("output");
    var colorSquare = document.createElement("input");
    colorSquare.value = color;
    colorSquare.style.height = "20px";
    colorSquare.classList.add("coloris");
    colorSquare.name = pos;
    colorSquare.pattern = color;
    list.appendChild(colorSquare);
    Coloris({
        el: '.coloris',
        swatches: ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'],
        theme: 'large',
        themeMode: 'light',
        format: 'hex',
        onChange: (color, event) => {
            colorSquare.pattern = color;
            let hex = color.substring(1).match(/.{1,2}/g);
            let red = parseInt(hex[0], 16);
            let green = parseInt(hex[1], 16);
            let blue = parseInt(hex[2], 16);
            let alpha = parseInt("ff", 16);

            if (hex.length === 4) {
                alpha = parseInt(hex[3], 16);
            }

            let pos = parseInt(event.name);
            bytes[pos + 1] = blue;
            bytes[pos + 2] = green;
            bytes[pos + 3] = red;
            bytes[pos + 4] = alpha;

            let dlbutton = document.getElementById("dlbutton");
            const eventType = "click";
            const options = { capture: true, once: false, passive: false };
            dlbutton.removeEventListener(eventType, null, options);
            document.getElementById("button").style.display = "flex";
            dlbutton.addEventListener("click", e => {
                zip.file("resources.arsc", bytes);
                zip.remove("META-INF");
                zip.generateAsync({ type: 'blob' })
                    .then(function(content) {
                        let file = new File([content], "base.apk");
                        signAndDownload(file);
                    });
            });
        },
    });
}

async function signAndDownload(app) {
    let signDiv = document.getElementById("sign");
    let button = document.getElementById("button");
    button.style.display = "none";
    signDiv.style.display = "flex";
    let span = signDiv.childNodes[1];
    let spinner = signDiv.childNodes[3];
    let width = getComputedStyle(span).width;
    spinner.width = width;
    spinner.height = width;
    const packageSigner = new PackageSigner("insecure", "android");
    const key = getKey();
    packageSigner.signPackage(app, key)
        .then(function(signedB64File) {
            var a = document.createElement("a");
            a.href = signedB64File;
            a.download = "base.apk";
            a.click();
            signDiv.style.display = "none";
            button.style.display = "flex";
        });
}

function handleDrop(event) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    handleFiles(files);
}

function handleFiles(files) {
    console.log(files);
    document.getElementById("upload").style.display = "none";
    document.getElementById("load").style.display = "inline";
    Array.prototype.forEach.call(files, function(file) {
        let apk;
        JSZip.loadAsync(file)
            .then(function(zip) {
                apk = zip;
                return zip.file('resources.arsc').async('uint8array');
            })
            .then(function(fileContents) {
                bytes = fileContents;
                let byteMap = {};

                var i = 0;
                var chunkSize = 1000;

                function processChunk() {
                    var end = Math.min(i + chunkSize, bytes.length);
                    for (; i < end; ++i) {
                        let preColor = new Uint8Array([0x1c, 0x1d, 0x1e, 0x1f]);

                        if (preColor.includes(bytes[i]) && i >= 3 && bytes[i - 1] === 0x00 && bytes[i - 2] === 0x00 && bytes[i - 3] === 0x08) {
                            let data = bytes.slice(i + 1, i + 5);
                            byteMap[i] = data;
                            let rgb = bytes.slice(i + 1, i + 4).reverse();
                            let rgba = new Uint8Array(rgb.length + 1);
                            rgba.set(rgb);
                            rgba[rgba.length - 1] = bytes[i + 4];
                            let color = `#${rgba.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "")}`;
                            let current = i;
                            setTimeout(() => {
                                addColor(apk, color, current);
                            }, 0);
                            i += 4;
                        }
                    }

                    if (i < bytes.length) {
                        setTimeout(processChunk, 0);
                    }
                }
                processChunk();
            });
    });
}
