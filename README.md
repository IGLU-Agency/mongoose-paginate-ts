[![npm version](https://badge.fury.io/js/mongoose-paginate-ts.svg)](https://badge.fury.io/js/mongoose-paginate-ts)

# mongoose-paginate-ts

Typescript pagination (with page or cursor) plugin for [Mongoose](http://mongoosejs.com)

[![NPM](https://nodei.co/npm/mongoose-paginate-ts.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/mongoose-paginate-ts)

## Installation

```sh
npm install mongoose-paginate-ts
```

## Usage

Add plugin for a mongoose schema to inject a `paginate` method for pagination:

```ts
import { mongoosePagination, Pagination } from "mongoose-paginate-ts";
type User = mongoose.Document & {
  username: String,
  accounts: [mongoose.Types.ObjectId]
};
const userSchema = new Schema({
  username: String,
  accounts: [{ type: ObjectId, ref: "Account" }]
});
userSchema.plugin(mongoosePagination);
const User: Pagination<User> = mongoose.model<User, Pagination<User>>("User", userSchema);

//User.paginate()
```

### Model.paginate([options], [callback])

#### **Parameters**

- `[options]` {Object}
  - `[query]` {Object} - Query conditions. [Documentation](https://docs.mongodb.com/manual/tutorial/query-documents/)
  - `[select]` {Object | String} - Fields to return (by default returns all fields). [Documentation](http://mongoosejs.com/docs/api.html#query_Query-select)
  - `[sort]` {Object | String} - Sort order. [Documentation](http://mongoosejs.com/docs/api.html#query_Query-sort)
  - `[populate]` {Object | String} - Paths which should be populated with other documents. [Documentation](http://mongoosejs.com/docs/api.html#query_Query-populate)
  - `[page=1]` {Number}, 
  - `[limit=10]` {Number}, number of docs per page, default is 10
  - `[key=_id]` {String}, cursor id pagination 
  - `[startingAfter]` {String}, A cursor for use in pagination. startingAfter is an object ID that defines your place in the list. For instance, if you make a list request and receive 100 objects, ending with obj_foo, your subsequent call can include startingAfter=obj_foo in order to fetch the next page of the list.
  - `[endingBefore]` {String}, A cursor for use in pagination. endingBefore is an object ID that defines your place in the list. For instance, if you make a list request and receive 100 objects, starting with obj_bar, your subsequent call can include endingBefore=obj_bar in order to fetch the previous page of the list.
  - `[forceCountFunction=false]` {Boolean} - Set this to true, if you need to support $geo queries.
  - `[lean=true]` {Boolean} - Set this to false, if you need to disable the lean.
- `[callback(err, result)]` - The callback is called once pagination results are retrieved or when an error has occurred

#### Result value

Promise fulfilled with an Pagination:

```ts
class PaginationModel {
  totalDocs: number | undefined;
  limit: number | undefined = 0;
  totalPages: number | undefined;
  page: number | undefined;
  pagingCounter: number | undefined;
  hasPrevPage: Boolean | undefined = false;
  hasNextPage: Boolean | undefined = false;
  prevPage: number | undefined;
  nextPage: number | undefined;
  hasMore: Boolean | undefined = false;
  docs: any[] = [];
}
```

### Examples

#### Paginate with

```ts
User.paginate({}).then((error: Error, result: any) => {
  // ...
});

var results = await User.paginate({})
```

#### More advanced example

```ts
var options = {
  query: {},
  select: "title date author",
  sort: { date: -1 },
  populate: "account",
  limit: 5
};

User.paginate(options).then((error: Error, result: any) => {
  // ...
});

var results = await User.paginate(options)
```

## License

[MIT](LICENSE)