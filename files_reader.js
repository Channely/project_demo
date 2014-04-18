var fs = require('./models/file_operate.js');
var f = require("fs")
var files_arr = [];
fs.list("./angular part-one template",function(files){
    for(var i in files){
        files_arr.push({
            name: files[i].name,
            path: files[i].url.slice(1,files[i].url.length)
        })
    }
    f.writeFileSync("./files.json",JSON.stringify(files_arr));
    console.log(files_arr);
})