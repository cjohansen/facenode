var http = require("http");
var fs = require("fs");
var qs = require("querystring");
var formidable = require("formidable");
var cp = require("child_process");

var server = http.createServer();
var faces = [];

function reqBody(req, callback) {
    var body = "";
    req.setEncoding("utf-8");
    req.on("data", function (chunk) { body += chunk; });
    req.on("end", function () { callback(body); });
}

function requestParams(req, callback) {
    reqBody(req, function (body) {
        callback(qs.parse(body));
    });
}

function addFace(req, res) {
    var form = formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {
        faces.push({
            id: faces.length,
            name: fields.name,
            face: files.face
        });
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end("<h1>Thanks, " + fields.name + "!</h1>" +
                "<a href='/'>Back</a>");
    });
}

function formatFaces() {
    return faces.reduce(function (html, face) {
        return html + "<h2>" + face.name + "</h2>" +
            "<img src='/images/" + face.id + "/100x100'>";
    }, "");
}

function serveImage(res, id, size) {
    var img = faces[id].face;
    res.writeHead(200, { "Content-Type": img.type });
    cp.spawn("convert",
             ["-resize", size, img.path, "-"]).stdout.pipe(res);
}

server.on("request", function (req, res) {
    console.log(req.method, req.url);

    if (req.method == "POST") {
        return addFace(req, res);
    }

    var imgMatch = req.url.match(/\/images\/(\d+)\/(.*)/);
    if (imgMatch) {
        return serveImage(res, imgMatch[1], imgMatch[2]);
    }

    res.writeHead(200, { "Content-Type": "text/html" });

    fs.readFile("index.html", "utf-8", function (err, data) {
        res.write(data.replace("{{faces}}", formatFaces()));
        res.end();
    });
});

server.listen(9666);

console.log("Server running on http://localhost:" + 9666);

process.on("uncaughtException", function (err) {
    console.log("I failed and I don't care");
    console.log(err.stack);
});
