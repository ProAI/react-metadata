import React from 'react';
import MetaContext from './MetaContext';

/* eslint-disable react/prop-types */
function MetaProvider({ children, client }) {
  if (!client) {
    throw new Error('MetaProvider: You must provide a MetaClient instance.');
  }

  return <MetaContext.Provider value={client}>{children}</MetaContext.Provider>;
}
/* eslint-enable */

export default MetaProvider;
