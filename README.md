# 🏷️ React Metadata

Simple lightweight metadata handler for React.

## Problem

On the one hand handling metadata from scratch with React is hard. On the other hand existing solutions mostly provide a lot of configuration options, which makes it also hard to set it up.

## Solution

`react-metadata` aims to fill the gap between these two sides. It provides an easy way to define metadata. Once you update metadata, previous metadata will be deleted. Ideally you use `react-metadata` together with a router, so that you can set the metadata per route.

## Installation

```shell
npm install react-metadata
# or
yarn add react-metadata
```

## Usage

Create a meta client instance and use the meta provider in your app entry:

```jsx
import React from 'react';
import { MetaClient, MetaProvider } from 'react-metadata';

const context = {
  titleTemplate: 'Acme App',
};

const metaClient = new MetaClient([{ title: 'Acme App' }], context);

function App({ children }) {
  return <MetaProvider client={metaClient}>{children}</MetaProvider>;
}
```

The code above demonstrates that `MetaClient` accepts two parameters:

| Parameter     | Description                                                                                                                                                                |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `initialData` | The initial metadata, which is an array of meta descriptors. The meta descriptors are the same as the [Remix meta descriptors](https://remix.run/docs/en/main/route/meta). |
| `context`     | This can be any value that you want to pass down to `useMeta`.                                                                                                             |

Afterwards you can use the `useMeta` hook in your components to update. Again the `useMeta` hook accepts an array of [Remix like meta descriptors](https://remix.run/docs/en/main/route/meta). Once you call `useMeta`, the current meta will be deleted. The current meta is either the initial data (if you have not called `useMeta` yet) or the data of the last `useMeta` call.

```jsx
import { useMeta } from 'react-metadata';

function Dashboard() {
  useMeta([{ title: 'Dashboard' }]);

  ...
}
```

As described above you can also make use of the `context`. For that you need to pass a function to `useMeta` that returns the meta descriptors:

```jsx
import { useMeta } from 'react-metadata';

function Dashboard() {
  useMeta(context => ([{ title: `Dashboard | ${context.titleTemplate}` }]));

  ...
}
```

### Full template

For convenience it might also make sense to create a full meta template. We can do that by defining the context as a function:

```javascript
const context = (input) => {
  const title = input.title ? `${input.title} | Acme App` : 'Acme App';
  const description = input.description || 'The Acme app is a very useful app.';

  return [
    {
      title,
    },
    {
      name: 'description',
      content: description,
    },
    {
      property: 'og:title',
      content: title,
    },
    {
      property: 'og:description',
      content: description,
    },
  ];
};

// Use raw template as initial data by defining the initial data as a function that gets the context.
const metaClient = new MetaClient((makeData) => makeMeta(), context);
```

```jsx
import { useMeta } from 'react-metadata';

function Dashboard() {
  useMeta(makeMeta => makeMeta({
    title: 'Dashboard',
    description: 'The Acme app dashboard is unbelievable.',
  }));

  ...
}
```

### Server side rendering

This package also supports server side rendering. You can call `metaClient.getElements()` to get all meta tags as React elements. These elements should be inserted in the `<head>` tag of your initial html.

## License

This package is released under the [MIT License](LICENSE).
