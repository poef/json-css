# json-css

querySelectorAll for JSON data

## How do I use it

To use JSON-CSS on a set of data, you need to initialize it first:

```
    jsonCSS.init(data);
```

Then you can call the method `search` on the data:

```
    var results = data.search('title[value~="Stand"]');
```

## When should I use this?

If you have a relatively large dataset in JSON and want a quick and easy way to filter or select elements from it in javascript. 

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
    var results = data.search('title[value~="Stand"');
```

### Get all books that have a title that contains the word 'Stand'

```
    var results = data.search('books > *','title[value~="Stand"');
```

This works because the first CSS selector tells jsonCSS which elements to return in the result set. The second, third, etc. selector work as filters on the initial set.

You could also write this with CSS4 selectors as:

```
    var results = data.search('books > *:has(title[value~="Stand"])');
```

Unfortunately, no browsers support the `:has` selector yet. The good news is, when browser finally implement this, you can immediately start using it. There is no need to update the
jsonCSS library.

### Get all books that contain the string 'Stand' in their title

```
    var results = data.search('books > *','title[value*="Stand"');
```

### Get at most 2 books that contain the string 'Stand' in their title

```
    var results = data.search('books > *','title[value*="Stand"').slice(0,2);
```

The result set is a normal javascript array, so you can use the normal methods, like slice, on it.


### Get all books that contain the string 'Stand', ordered by title

```
    var results = data.search('books > *','title[value*="Stand"')
    .sort( function(a,b) {
        return (a.title < b.title ? -1 : 1);
    });
```

## Special characters in property names

If your JSON data contains properties with spaces, quotes or other characters that aren't valid in a HTML5 tag name, you must write the CSS selector slightly differently:

With a property name "first name", instead of this:

```
    var results = data.search('persons > *', 'first name[value~="John"]');
```

Use this:

```
    var results = data.search('persons > *', '[name="first name"][value~="John"]');
```

For quotes, greater-than and smaller-than, use their HTML entity counterparts: &quot;, &gt; and &lt;.

## Debugging

Sometimes it isn't very clear what the selector should look like from just the JSON data. In that case it might help to see what the DOM tree looks like, that jsonCSS generates from your data.

```
    console.log(data.searchElement);
```

This will show you the entire DOM tree for your data in your browsers console. You can click through it in most browsers.

# Why did we make this?

There are many options to make JSON data searchable, like defiant.js, json-query or even pouchDB. But they all require you to learn a complex new syntax and some require quite a lot of code to be included and maintained as well.

We just wanted something a bit easier than writing our own tree walking and filtering code in javascript. We actually tried defiant.js first, but after a few aborted tries decided that xpath is not meant for normal humans. Since we already knew CSS, why not use that for the heavy lifting?

