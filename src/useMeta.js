import { useRef, useContext } from 'react';
import MetaContext from './MetaContext';

export default function useMeta(data) {
  const applied = useRef(false);
  const client = useContext(MetaContext);

  if (!applied.current) {
    client.update(data);
    applied.current = true;
  }
}
