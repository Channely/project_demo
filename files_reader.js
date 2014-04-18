var fp = require("./file_operate.js");
var fs = require("fs");
var tar = require("tar.gz");
var files_arr = [];
var tar_gz = new tar();
tar_gz.extract("angular part-one template.tar.gz","./",function(){
    fp.list("./angular part-one template",function(files){
        for(var i in files){
            files_arr.push({
                name: files[i].name,
                path: files[i].url.slice(1,files[i].url.length)
            })
        }
        fs.writeFileSync("./project.json",JSON.stringify(files_arr));
        console.log(files_arr);
    })
})