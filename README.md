This package enables passing large amounts of data to AI models without exceeding the context length.

# Core idea

Data given to the AI should be as concise as possible and not contain duplicated data (e.g. same destination locations of recurring departures in a list of departures)

That's why we need a general library that takes in any json object or array and looks for duplicate id's of objects stored under the same key.

Then this id (prefixed with the key of the object) is stored in a new object, added by our library. The so called "database". If no id is present in duplicated entries, a new id will be generated.

The library then returns a json object as follows:

```js
{
database: {
// ... the deduplicated objects identified by newly composed id's
},
data: {
// the original data with duplicating elements replaced
// by id's corresponding to the database
}
}
```
