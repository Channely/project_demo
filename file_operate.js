var fs = require('fs');
var path = require('path');

var dir = {
    user: 'public/user',
    project: "public/template",
    public: "public"
}

var mkdir = function (dirpath, mode, callback) {
    path.exists(dirpath, function (exists) {
        if (exists) {
            callback(dirpath);
        } else {
            mkdir(path.dirname(dirpath), mode, function () {
                fs.mkdir(dirpath, mode, callback);
            });
        }
    });
};

var cp = function(src,target,cb){
    var fileReadStream = fs.createReadStream(src);
    var fileWriteStream = fs.createWriteStream(target);
    fileReadStream.pipe(fileWriteStream);

    fileWriteStream.on('close',function(){
        cb();
    });
}

var list_files = function (file_path, cb) {
    var walk = require('walk'), files = [];
    var walker = walk.walk(file_path, { followLinks: false });
    walker.on('file', function (root, stat, next) {
        files.push({name: stat.name,url: root + "/"});
        next();
    });

    walker.on('end', function () {
        cb(files);
    });
}

var read = function (url,name) {
    return {name: name, content: fs.readFileSync(url+name, 'utf8')};
}

var write = function (file_name, content,cb) {
    var paths = file_name.split("/")
    var name_length = paths[paths.length-1].length;
    var file_path = file_name.slice(0,file_name.length-name_length);
    var interval = setInterval(function(){
        check_dir(file_path,function(exists){
            if(exists){
                fs.open(file_name, "w", 0644, function (e, fd) {
                    if (e) throw e;
                    fs.write(fd, content, 0, 'utf8', function (e) {
                        if (e) throw e;
                        cb();
                        fs.closeSync(fd);
                    });
                });
                clearInterval(interval);
            }
        });
    },5);
}


var copy = function (project_path, user_path,call_back) {
    list_files(project_path, function (result) {
        var mkdir_count = 0;
        var cp_count = 0;
        for (var i in result) {
            result[i].url = result[i].url.split(dir.project)[1];
            mkdir(user_path.slice(0,user_path.length-1) + result[i].url, 0755,function(){
                cp(dir.project+result[mkdir_count].url+result[mkdir_count].name,user_path.slice(0,user_path.length) + result[mkdir_count].url + result[mkdir_count].name,function(){
                    cp_count++;
                    if(cp_count == result.length){
                        call_back();
                    }
                });
                mkdir_count ++;
            });
        }
    });
}

var tar = function (project, position, cb) {
    var targz = require('tar.gz');
    new targz().compress(position + "/" + project, position + "/" + project + ".tar.gz", cb);
}

var rm = function (path) {
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) { // recurse
                rm(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

var check_dir = function (dirpath, callback) {
    path.exists(dirpath, callback);
}

module.exports = {
    mkdir: mkdir,
    write: write,
    read: read,
    position: dir,
    copy: copy,
    tar: tar,
    rm: rm,
    check: check_dir,
    list:list_files
}