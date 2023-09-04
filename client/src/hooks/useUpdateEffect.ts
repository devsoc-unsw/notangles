import { useEffect, useRef } from 'react';

// https://stackoverflow.com/a/55075818/1526448
const useUpdateEffect = (effect: () => void, dependencies: unknown[] = []) => {
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      effect();
    }
  }, dependencies);
};

export default useUpdateEffect;
