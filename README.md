# json-css-search

json-css-search is a querySelectorAll for javascript data in the browser. 

## Install

### Browser using Unpkg CDN

`<script src="https://unpkg.com/json-css-search@1.0.0/json-css.js"></script>`

### Using NPM

`npm install json-css-search`

### Using GIT

`git clone https://github.com/SimplyEdit/json-css-search.git`

## Usage

To use JSON-CSS on a set of data, you need to initialize it first:

```
    var searcher = jsonCSS.init(data);
```

Then you can call the method `query` on the data:

```
    var results = searcher.query('title[value~="Stand"]');
```

This returns the results as an array of name / value objects, like this:

```
[
    {
        "key":"title",
        "value":"Stand on Zanzibar",
        "node": domNode
    },
    {
        "key":"title",
        "value":"Stand By Me (Special Edition)",
        "node": domNode
    }
]
```

If you just want the values, without the key and domNode, call `values()` on the result:

```
    var values = searcher.query('title[value~="Stand"]').values();
```

Which returns:

```
    ["Stand on Zanzibar", "Stand By Me (Special Edition)"]
```

And if you want the jsonPath entries, call `paths()` on the result:

```
    var paths = searcher.query('title[value~="Stand"]').paths();
```

Which returns:

```
    ["books[711].title", "books[729].title"]
```

Or combine it and get the paths and values, by calling `tree()` on the result:

```
    var tree = searcher.query('title[value~="Stand"]').tree();
```

Which returns:

```
    {
        "books[711].title": "Stand on Zanzibar", 
        "books[729].title": "Stand By Me (Special Edition)"
    }
```


## When should I use this?

If you have a relatively large dataset and want a fast and simple way to filter or select elements from it in javascript.

jsonCSS allows you to use your knowledge of CSS selectors to select elements from your JSON data set. Because CSS selector engines have been extremely optimized in browsers, this is also one of the fastest way to search through data in your browser. 

The downsides are that CSS selectors are limited in scope and there is an initial performance hit to transform the JSON data to HTML5 elements. 

A set of about 10,000 elements can take up to 1 second in Internet Explorer or Edge to render, Firefox and Chrome manage to this in about 350 ms. However searches are down to single or double digits in ms.

## How does it work?

The jsonCSS.init method parses the data and creates a DOM tree of the data as HTML5 elements. Then it adds a search method to your data, that runs the CSS selectors on that DOM tree. The results are mapped back to your data structure.

Note: this means that if you change your data, you must call jsonCSS.init() on it again, so the DOM tree is updated.


## Examples

These examples assume you use the books.json dataset.

### Get all titles that contain the word 'Stand'

```
    var results = searcher.query('title[value~="Stand"');
```

### Get all books that have a title that contains the word 'Stand'

```
    var results = searcher.query('books > *','title[value~="Stand"');
```

This works because the first CSS selector tells jsonCSS which elements to return in the result set. The second, third, etc. selector work as filters on the initial set.

You could also write this with CSS4 selectors as:

```
    var results = searcher.query('books > *:has(title[value~="Stand"])');
```

Unfortunately, no browsers support the `:has` selector yet. The good news is, when browser finally implement this, you can immediately start using it. There is no need to update the
jsonCSS library.

### Get all books that contain the string 'Stand' in their title

```
    var results = searcher.query('books > *','title[value*="Stand"]');
```

### Get at most 2 books that contain the string 'Stand' in their title

```
    var results = searcher.query('books > *','title[value*="Stand"]').slice(0,2);
```

The result set is a normal javascript array, so you can use the normal methods, like slice, on it.

### Get all books that contain the string 'Stand' in their title and are written by John Brunner

```
    var results = searcher.query('books > *',
    'title[value*="Stand"]', 'author[value="John Brunner"]');
```

Each additional selector is an additional filter on the result set, so it is effectively an 'and' operation.

### Get all books that contain the string 'Stand' in their title or are written by John Brunner

```
    var results = searcher.query('books > *',
    'title[value*="Stand"], author[value="John Brunner"]');
```

It's a subtle difference with the previous query, but by combining two selectors into a single string, you tell the browser that either selector may match independently, so effectively it's an 'or' operation.

### Get all books that contain the string 'Stand', ordered by title

```
    var results = searcher.query('books > *','title[value*="Stand"]')
    .sort( function(a,b) {
        return (a.title < b.title ? -1 : 1);
    });
```

## Special characters in property names

If your JSON data contains properties with spaces, quotes or other characters that aren't valid in a HTML5 tag name, you must write the CSS selector slightly differently:

With a property name "first name", instead of this:

```
    var results = searcher.query('persons > *', 'first name[value~="John"]');
```

Use this:

```
    var results = searcher.query('persons > *', '[name="first name"][value~="John"]');
```

For quotes, greater-than and smaller-than, use their HTML entity counterparts: &quot;, &gt; and &lt;.

## Updating data

When the data changes, the search cache must also be updated. You can do this by calling:

```
    searcher.update();
```

## Debugging

Sometimes it isn't very clear what the selector should look like from just the JSON data. In that case it might help to see what the DOM tree looks like, that jsonCSS generates from your data.

```
    console.log(searcher.dom);
```

This will show you the entire DOM tree for your data in your browsers console. You can click through it in most browsers.

# Why did we make this?

There are many options to make JSON data searchable, like defiant.js, json-query or even pouchDB. But they all require you to learn a complex new syntax and some require quite a lot of code to be included and maintained as well.

We just wanted something a bit easier than writing our own tree walking and filtering code in javascript. We actually tried defiant.js first, but after a few aborted tries decided that xpath is not meant for normal humans. Since we already knew CSS, why not use that for the heavy lifting?

