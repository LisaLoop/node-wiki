//determine page the user wants to see
var express = require('express');
var app = express();

const bodyParser = require("body-parser");

/** bodyParser.urlencoded(options)
 * Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST)
 * and exposes the resulting object (containing the keys and values) on req.body
 */
app.use(bodyParser.urlencoded({
    extended: true
}));

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json());


var fs = require('fs'),
    path = require('path');   

var site_template = "";
fs.readFile("./index.html", {encoding: 'utf-8'}, function(err,page_contents){
    if (!err) {
        site_template = page_contents;
    } else {
        console.log(err);
    }
});
var css="";
fs.readFile("./styles.css", {encoding: 'utf-8'}, function(err,page_contents){
    if (!err) {
        css = page_contents;
    } else {
        console.log(err);
    }
});

let wrap = (content) => {
    let tmpl = site_template;
    tmpl = tmpl.replace("[#page]", content)
    return tmpl;
}
let page_editor = (page,contents) => {
    let htmlForm = `<form action="/" method="POST">
                    <h2>${page}</h2>
                    <textarea name="contents" id="" cols="120" rows="20">${contents}</textarea>
                    <input value="Save" type="submit"/>
                    <input value="${page}" type="hidden" name="page">
                     </form>`;
    return htmlForm;


}
app.post('/', function(req,response){
    let page = req.body.page;
    let contents = req.body.contents;
    // file_put_contents
    fs.writeFile("./pages/"+page, contents, function (err) {
        if (err) throw err;
        console.log('It\'s saved!');
      });

    console.log(page+" was edited");
    response.writeHead(301, {'Location': '/?page=' + page});
    
    response.end();
});
app.get('/styles.css', function (req, response) {
    response.writeHead(200, {'Content-Type': 'text/css'});

    response.write(css);
    response.end();
});
app.get('/', function (req, response) {
    var page = "index";
    var edit = "0";
    if("edit" in req.query){ 
        edit = req.query.edit;
    }
    
    if("page" in req.query){ 
        page = req.query.page;
    }
    var filePath = path.join(__dirname, 'pages',page);
    // file_exists
    console.log("path is ", filePath);
    response.writeHead(200, {'Content-Type': 'text/html'});
    fs.stat(filePath, function(err, stat) {
        if(err == null) {
            fs.readFile(filePath, {encoding: 'utf-8'}, function(err,page_contents){
                if (!err) {
                    console.log(edit);
                    if(edit=="1"){
                        console.log(edit,"==1");
                        //edit the page
                        response.write(wrap(page_editor(page,page_contents)));
                        response.end();
                    }else{
                        // show the page
                        page_contents = page_contents.replace(/\[([^\]]+)\]/gi, '<a href="/?page=$1">$1</a>');
                        page_contents += "<hr/>";
                        page_contents += `<a href=\"?page=${page}&edit=1\" >Edit this page</a>`;
                        response.write(wrap(page_contents));
                        response.end();
                    }
                } else {
                    console.log(err);
                }
            });
        } else if(err.code === 'ENOENT') {// Error NO ENTry 
            // file does not exist
            if(edit=="1"){
                response.write(wrap(page_editor(page,"")));
                response.end();
            
            }else{
                let page_contents = "This page does not exist, why not create it? ";
                page_contents += `<a href=\"?page=${page}&edit=1\" >Edit this page</a>`;
                response.write(wrap(page_contents));
                response.end();
            }
        } else {
            console.log('Page'+page+' was missing, or bad permissions?', err.code);
            console.log(err);// todo: add rollbar
            response.write(wrap("Internal Server Error"));
            response.end();
        }
   }); 
  

});

app.listen(process.env.PORT || 3000, function () {
  console.log('Example app listening on port 3000!');
});

//make a page editable

// link text inside pages to other pages

// Wiki stub links to have red color

