import moment from 'moment';

const QueryBuilder = {};
const FOUR_DAYS = 4 * 24 * 60 * 60 * 1000;

QueryBuilder.generateDateComponent = function (query) {

   function getDateString (d) {
      // support both date strings as well as numbers for the entries collection
      //return isNaN(d) ? new Date(d).toISOString() : new Date(Number(d)).toISOString();
      return isNaN(d) ? moment(d).toISOString(true) : moment(Number(d)).toISOString(true);
   }

   let d = query;

   if (!query) {
      // If no date is given, load data from the last four days,
      // similar to Nightscout
      const FOUR_DAYS_AGO = new Date(new Date().getTime() - FOUR_DAYS);
      d = { '$gte': FOUR_DAYS_AGO };
   }

   let dateQuery = [];

   if (d["$eq"]) {
      dateQuery.push("eq" + getDateString(d["$eq"]));
   }
   if (d["$gt"]) {
      dateQuery.push("gt" + getDateString(d["$gt"]));
   }
   if (d["$lt"]) {
      dateQuery.push("lt" + getDateString(d["$lt"]));
   }
   if (d["$gte"]) {
      dateQuery.push("ge" + getDateString(d["$gte"]));
   }
   if (d["$lte"]) {
      dateQuery.push("le" + getDateString(d["$lte"]));
   }

   return dateQuery;
}

export default QueryBuilder;