import { createElement } from 'react';
// eslint-disable-next-line import/no-unresolved
import { Platform } from 'react-native';

const MARKER = 'react-metadata-tags';

const isWeb = !Platform || Platform.OS === 'web';
const isServer = typeof window === 'undefined';

const getDOMElements = () => {
  if (!isWeb || isServer) {
    return null;
  }

  const markerElement = document.head.querySelector(`meta[name="${MARKER}"]`);

  if (!markerElement) {
    return null;
  }

  const numberOfElements = Number(markerElement.getAttribute('content'));

  if (Number.isNaN(numberOfElements)) {
    return null;
  }

  let currentElement = markerElement;
  const elements = [];

  for (let i = 0; i < numberOfElements; i += 1) {
    currentElement = currentElement.nextElementSibling;
    elements.push(currentElement);
  }

  return elements;
};

/* eslint-disable arrow-body-style */
export default class MetaClient {
  data = [];

  context;

  elements = [];

  constructor(initialData, context) {
    this.context = context;

    const elements = getDOMElements();

    if (elements) {
      this.hydrate(elements);
    } else if (initialData) {
      this.update(initialData);
    }
  }

  hydrate = (elements) => {
    const data = [];

    elements.forEach((element) => {
      const tagName = element.tagName.toLowerCase();

      if (tagName === 'title') {
        data.push({ title: element.textContent });
        return;
      }

      if (tagName !== 'meta' && tagName !== 'link') {
        throw new Error(`Unexpected tag name "${tagName}".`);
      }

      data.push({ ...element.attributes, tagName });
    });

    this.data = data;
    this.elements = elements;
  };

  update = (input) => {
    if (!isWeb) {
      return;
    }

    const data = typeof input === 'function' ? input(this.context) : input;

    if (!isServer) {
      let titleElement = null;

      this.elements.forEach((element) => {
        // Keep title element until update is done, so that there is no flickering.
        if (element.tagName === 'title') {
          titleElement = element;
        }

        element.remove();
      });

      const elements = data.map((descriptor) => {
        let element;

        if (descriptor.title) {
          element = titleElement || document.createElement('title');
          element.textContent = descriptor.title;

          if (element !== titleElement) {
            document.head.appendChild(element);
          }
        } else {
          const { tagName = 'meta', ...attributes } = descriptor;

          if (tagName !== 'meta' && tagName !== 'link') {
            throw new Error(`Unsupported tag name "${tagName}".`);
          }

          element = document.createElement(tagName);

          Object.entries(attributes).forEach(([name, value]) => {
            element.setAttribute(name, value);
          });

          document.head.appendChild(element);
        }

        return element;
      });

      if (titleElement) {
        titleElement.remove();
      }

      this.elements = elements;
    }

    this.data = data;
  };

  getElements = () => {
    const marker = createElement('meta', {
      name: MARKER,
      content: this.data.length,
    });

    if (this.data.length === 0) {
      return marker;
    }

    return [
      marker,
      ...this.data.map((descriptor) => {
        if (descriptor.title) {
          return createElement('title', null, descriptor.title);
        }

        const { tagName = 'meta', ...attributes } = descriptor;

        return createElement(tagName, attributes);
      }),
    ];
  };
}
/* eslint-enable */
