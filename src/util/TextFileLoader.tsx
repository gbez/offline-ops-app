import React, { useState, useEffect } from 'react';

type Props ={
    filePath: string
}

const TextFileLoader = ({ filePath }: Props) => {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchText = async () => {
      try {
        const base = import.meta.env.VITE_PUBLIC_URL;
        const url = `${base}/instructions/${filePath}.txt`;
        console.log(url);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const textContent = await response.text();
        setText(textContent);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error("Error fetching file:", err);
      }
    };

    fetchText();
  }, [filePath]); // Re-run effect if filePath changes

  if (error) {
    return <p>Error loading file: {error}</p>;
  }

  return (
    <div>
      <p>{text}</p>
    </div>
  );
};

export default TextFileLoader;
