import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useBreakpoints } from '../../hooks/useMediaQuery';
import styles from './Navigation.module.css';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { isMobile } = useBreakpoints();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <Link to="/" className={styles.brandLink}>
            React Boilerplate
          </Link>
        </div>
        
        <ul className={styles.navList}>
          <li>
            <Link 
              to="/" 
              className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
            >
              Home
            </Link>
          </li>
          <li>
            <Link 
              to="/about" 
              className={`${styles.navLink} ${isActive('/about') ? styles.active : ''}`}
            >
              About
            </Link>
          </li>
          <li>
            <Link 
              to="/components" 
              className={`${styles.navLink} ${isActive('/components') ? styles.active : ''}`}
            >
              Components
            </Link>
          </li>
          <li>
            <Link 
              to="/api-examples" 
              className={`${styles.navLink} ${isActive('/api-examples') ? styles.active : ''}`}
            >
              {isMobile ? 'API' : 'API Examples'}
            </Link>
          </li>
        </ul>

        <div className={styles.actions}>
          <ThemeToggle size="small" />
        </div>
      </div>
    </nav>
  );
};

export default Navigation;