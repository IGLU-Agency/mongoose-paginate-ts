# mongoose-pagination-ts

Typescript pagination plugin for [Mongoose](http://mongoosejs.com)

[![NPM](https://nodei.co/npm/mongoose-pagination-ts.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/mongoose-pagination-ts)

## Installation

```sh
npm install mongoose-pagination-ts
```

or

```sh
yarn add mongoose-pagination-ts
```

## Usage

Add plugin for a mongoose schema to inject a `paginate` method for pagination:

```ts
import { mongoosePagination, Pagination } from "mongoose-pagination-ts";
type CateUsergory = mongoose.Document & {
  username: String,
  accounts: [String]
};
const userSchema = new Schema({
  username: String,
  accounts: [{ type: ObjectId, ref: "Account" }]
});
userSchema.plugin(mongoosePagination);
const User: Pagination<User> = mongoose.model<User, Pagination<TUser>>("User", userSchema);

//User.paginate()
```

### Model.paginate([query conditions], [options], [callback])

#### **Parameters**

- `[options]` {Object}
  - `[query]` {Object} - Query conditions. [Documentation](https://docs.mongodb.com/manual/tutorial/query-documents/)
  - `[select]` {Object | String} - Fields to return (by default returns all fields). [Documentation](http://mongoosejs.com/docs/api.html#query_Query-select)
  - `[sort]` {Object | String} - Sort order. [Documentation](http://mongoosejs.com/docs/api.html#query_Query-sort)
  - `[populate]` {Object | String} - Paths which should be populated with other documents. [Documentation](http://mongoosejs.com/docs/api.html#query_Query-populate)
  - `[page=1]` {Number}, **if undefined, will return all docs without pagination**
  - `[limit=10]` {Number}, number of docs per page, default is 10
- `[callback(err, result)]` - If specified the callback is called once pagination results are retrieved or when an error has occurred

#### Return value

Promise fulfilled with an IPaginateResult:

```ts
interface IPaginateResult<T> {
  data: T[];
  pagination: IPagination;
}

interface IPagination {
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
  limit: number;
  page?: number | null;
  totalPages?: number;
}
```

### Examples

#### Paginate with

```ts
await Model.paginate({}).then(result => {
  // ...
});
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

User.paginate(conditions, options).then(result => {
  // ...
});
```

## License

[MIT](LICENSE)