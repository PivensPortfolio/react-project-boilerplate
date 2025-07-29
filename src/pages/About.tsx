import React from 'react';

const About: React.FC = () => {
  return (
    <div>
      <h1>About</h1>
      <p>This React Project Boilerplate includes:</p>
      <ul>
        <li>React 18 with TypeScript</li>
        <li>Vite for fast development and building</li>
        <li>React Router for navigation</li>
        <li>ESLint and Prettier for code quality</li>
        <li>Vitest for testing</li>
        <li>Kiro-specific configurations</li>
      </ul>
    </div>
  );
};

export default About;