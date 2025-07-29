import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui';
import { useBreakpoints } from '../hooks/useMediaQuery';
import { useTheme } from '../hooks/useTheme';
import styles from './Home.module.css';

const Home: React.FC = () => {
  const { isMobile } = useBreakpoints();
  const { isDark } = useTheme();

  const features = [
    {
      title: 'Modern React',
      description: 'Built with React 18, TypeScript, and Vite for fast development',
      icon: '⚛️',
    },
    {
      title: 'Theme System',
      description: 'Dark/light mode with CSS custom properties and responsive design',
      icon: '🎨',
    },
    {
      title: 'UI Components',
      description: 'Comprehensive component library with accessibility support',
      icon: '🧩',
    },
    {
      title: 'State Management',
      description: 'Zustand for lightweight and efficient state management',
      icon: '📦',
    },
    {
      title: 'Testing Ready',
      description: 'Vitest and React Testing Library setup with examples',
      icon: '🧪',
    },
    {
      title: 'Kiro Integration',
      description: 'Pre-configured for Kiro AI development workflows',
      icon: '🤖',
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>
          React Project Boilerplate
        </h1>
        <p className={styles.subtitle}>
          A comprehensive starter template with modern React development tools, 
          theme system, and Kiro AI integration.
        </p>
        
        <div className={styles.actions}>
          <Button as="a" href="/components" size={isMobile ? 'medium' : 'large'}>
            Explore Components
          </Button>
          <Button 
            as="a" 
            href="/api-examples" 
            variant="outline" 
            size={isMobile ? 'medium' : 'large'}
          >
            View Examples
          </Button>
        </div>

        <div className={styles.themeIndicator}>
          <span className={styles.themeText}>
            Current theme: <strong>{isDark ? 'Dark' : 'Light'}</strong>
          </span>
        </div>
      </div>

      <div className={styles.features}>
        <h2 className={styles.featuresTitle}>What's Included</h2>
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.quickStart}>
        <h2>Quick Start</h2>
        <div className={styles.quickStartContent}>
          <div className={styles.quickStartText}>
            <p>Get started by exploring the components and examples:</p>
            <ul className={styles.quickStartList}>
              <li>
                <Link to="/components" className={styles.quickStartLink}>
                  UI Components Demo
                </Link> - Interactive showcase of all available components
              </li>
              <li>
                <Link to="/api-examples" className={styles.quickStartLink}>
                  API Examples
                </Link> - HTTP client and error handling examples
              </li>
              <li>
                <Link to="/about" className={styles.quickStartLink}>
                  About
                </Link> - Learn more about the architecture and features
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;