import { useEffect, useState } from 'react';
import { API_URL } from '../../api/config';

interface ValidationResult {
  status: string;
  data?: string;
  error?: string;
}

const CtfValidate = () => {
  const [validateResult, setValidateResult] = useState<ValidationResult>({
    status: 'Validating...',
  });

  const CHUNK_SIZE = 1024 * 10;

  const handleValidate = async () => {
    try {
      const localStorageData = btoa(localStorage.getItem('data') || '');

      if (!localStorageData) {
        throw new Error('No local storage data found');
      }

      const chunks: string[] = [];
      for (let i = 0; i < localStorageData.length; i += CHUNK_SIZE) {
        chunks.push(localStorageData.slice(i, i + CHUNK_SIZE));
      }

      for (let i = 0; i < chunks.length; i++) {
        const response = await fetch(`${API_URL.server}/ctf/validate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chunk: chunks[i],
            index: i,
            totalChunks: chunks.length,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to send chunk ${i + 1}/${chunks.length}`);
        }
      }

      const completeResponse = await fetch(`${API_URL.server}/ctf/validate/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalChunks: chunks.length,
        }),
      });
      const result = await completeResponse.json();
      if (completeResponse.ok) {
        return result;
      } else {
        throw new Error(`${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      return {
        status: 'Validation Failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  useEffect(() => {
    const validateCTFConfig = async () => {
      const result = await handleValidate();
      setValidateResult(result);
    };

    validateCTFConfig();
  }, []);

  return (
    <div>
      <div>
        <p>Result: {validateResult.status}</p>
        {validateResult.data && <p>Flag: {atob(validateResult.data)}</p>}
      </div>
    </div>
  );
};
export default CtfValidate;
