const dirTree = require('directory-tree');
const path = require('path');
const fs = require('fs-extra');
const _ = require('lodash');

module.exports.getTemplate = async function (objectType, space) {



   if (!objectType) throw 'FHIRTemplates: Object type is required';
   if (space && space.includes(' ' || space.incudes('/'))) throw 'FHIRTemplates: Invalid space name';
   if (objectType && objectType.includes(' ' || objectType.incudes('/'))) throw 'FHIRTemplates: Invalid objectType';

   if (!space) space = 'default';

   //    const tree = dirTree(__dirname);
   //    console.info(JSON.stringify(tree));

   let filePath = path.resolve(__dirname, './templates/' + space + '/' + objectType + '.json');
   // let filePath = '${__dirname}/templates/' + space + '/' + objectType + '.json';
   console.log('PAth: ', filePath);
   let template;

   try {
      const result = await fs.stat(filePath); // will fail if file does not exist
      if (await fs.exists(filePath)) {
         template = await fs.readFile(filePath, 'utf8');
      }
   } catch (error) {
      console.error('FHIRTemplates error: template for object type "' + objectType + '" not found');
      return;
   }

   return JSON.parse(template);


};
