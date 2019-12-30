import moment from 'moment';

const QueryBuilder = {};
const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;

QueryBuilder.generateQueryParameters = function (query, count) {

   function getDateString (d) {
      // support both date strings as well as numbers for the entries collection
      //return isNaN(d) ? new Date(d).toISOString() : new Date(Number(d)).toISOString();
      return isNaN(d) ? moment(d).toISOString(true) : moment(Number(d)).toISOString(true);
   }

   let d = query;

   if (!query) {
      // If no date is given, load data from the last two days,
      // similar to Nightscout
      const TWO_DAYS_AGO = new Date(new Date().getTime() - TWO_DAYS);
      d = { '$gte': TWO_DAYS_AGO };
   }

   const dateQuery = [];

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

   // filter by count

   const MAX_COUNT = 20000;
   // return 20 items by default
   const requestedCount = isNaN(count) ? false : Number(count);
   let finalCount = requestedCount ? requestedCount : 20;

   if (query) {
      // If date query is issued with a count, trust that count
      finalCount = requestedCount ? requestedCount : MAX_COUNT;
   }

   // two days worth of data @ 288 CGM entries / day, plus finger measures
   const queryCount = finalCount < 650 ? 650 : Math.min(finalCount, MAX_COUNT);

   return { dateQuery, queryCount, finalCount };
}

export default QueryBuilder;
