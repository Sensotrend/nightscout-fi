
/**
 * @typedef {Object} Codes
 * @property {array} categories - List of category strings
 * @property {array} codes - List of code strings
 */

/**
 * Parses the category codes and resource type codes from a FHIR resource, if present
 *
 * @param {Object} record The FHIR resource to be parsed
 * @param {Object} logger A logger object if you want to redirect logging to outside the console. The class will call logger.error if needed.
 * @return {Codes} Codes from the parsed object
 */
export function getCodes (record, logger = { error: console.error }) {
   const returnValue = {
      categories: [],
      codes: []
   };

   try {
      if (record.category && record.category.coding) {
         record.category.coding.forEach(function (e) {
            returnValue.categories.push(e.code);
         });
      }
      if (record.code && record.code.coding) {
         record.code.coding.forEach(function (e) {
            returnValue.codes.push(e.code);
         });
      }
   } catch (error) {
      logger.error('Error parsing codes from FHIR resource: ' + error);
   }
}
