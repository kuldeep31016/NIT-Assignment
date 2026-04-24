import { useCallback, useState } from 'react';

export default function useAsync(asyncFn) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError('');
      try {
        return await asyncFn(...args);
      } catch (err) {
        setError(err.response?.data?.error || 'Request failed');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFn]
  );

  return { loading, error, execute };
}
