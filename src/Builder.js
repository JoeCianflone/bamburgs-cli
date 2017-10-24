const shell    = require('shelljs');

module.exports = class Builder {
   constructor(results) {
      this.config = results;

      return this;
   }

   setFiles(fileObject) {
      this.config.files = Object.keys(fileObject).map((key, index) => {
         return fileObject[key].map((value, index) => {
            if (key == 'dist') {
               return `${process.cwd()}/dist/${value}`;
            }
            return `${process.cwd()}/${value}`;
         });
      });

      return this;
   }

   setTemplates(templateObject) {
      this.config.templates = templateObject;

      return this;
   }

   setHash(hash) {
      this.config.hash = hash;

      return this;
   }

   setLocation(loc) {
      this.config.location = loc;

      return this;
   }

   getLocation() {
      return this.config.location;
   }

   getDownloadPath() {
      return `${this.config.location}/${this.config.hash}`;
   }

   removeFiles(fs) {
      Object.keys(this.config.files).map((key, value) => {
         this.config.files[key].forEach((file) => {
            fs.removeSync(file);
         });
      });

      fs.removeSync(`${this.config.location}/${this.config.src}`);
      fs.removeSync(`${this.config.location}/${this.config.dist}`);
      fs.removeSync(`${this.config.location}/node_modules`);
      fs.removeSync(`${this.config.location}/package.json`);
      fs.removeSync(`${this.config.location}/.gitignore`);
      fs.removeSync(`${this.config.location}/template.html`);

   }

   generateFilesFromTemplates(fs) {
      Object.keys(this.config.templates).map((key, value) => {
         let template = `${this.config.location}/${this.config.hash}/${key}.template`;
         let newFile = `${this.config.location}/${this.config.templates[key]}`;

         fs.readFile(template, 'utf8', (err, data) => {
            let updateData = data.replace('{{name}}', this.config.name.toLowerCase())
                                 .replace('{{author}}', this.config.author)
                                 .replace('{{description}}', this.config.description)
                                 .replace('{{dist}}', this.config.dist)
                                 .replace('{{src}}', this.config.src)
                                 .replace('{{email}}', this.config.email);

            fs.writeFile(newFile, updateData, 'utf8', (err) => err ? console.log(err) : `${value} updated`);
         });
      });
   }

   copyFiles(fs) {
      Object.keys(this.config.files).map((key, value) => {
         this.config.files[key].forEach((key, index) => {
            let fileName = key.substr(key.lastIndexOf('/')+1);
            let template = `${this.config.location}/${this.config.hash}/${fileName}`;

            fs.copy(template, key)
              .then((result) => console.log(`Copying: ${fileName}`))
              .catch((err) => console.log(`Unable to copy: ${fileName}`));
         });
      });
   }

   copySrcFile(fs) {
      return fs.copy(`${this.config.location}/${this.config.hash}/src`, `${process.cwd()}/${this.config.src}`);
   }

   removeHashFolder(fs) {
      return fs.removeSync(`${this.config.location}/${this.config.hash}`);
   }

   compileAssetsFirstTime(fs) {
      console.log("Installing Dependencies, this takes a bit...\n\n");
      let builder = this.config.compiler.toLowerCase() === 'y' ? 'yarn' : 'npm';

      shell.exec(`${builder} install`);
      console.log('Building...\n');
      shell.exec(`${builder} run build`);
      console.log('Build Complete\n');
   }
}
