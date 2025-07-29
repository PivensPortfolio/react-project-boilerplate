import React, { useState } from 'react';
import { Button, Input, Modal, Loading, Skeleton, ThemeToggle } from '../components/ui';
import { useBreakpoints } from '../hooks/useMediaQuery';
import ErrorExample from '../components/examples/ErrorExample';
import styles from './ComponentDemo.module.css';

const ComponentDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isMobile, isTablet } = useBreakpoints();

  const handleInputValidation = (_isValid: boolean, error?: string) => {
    setInputError(error || '');
  };

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>UI Components Demo</h1>
        <p className={styles.description}>
          Explore all the available UI components with theme support and responsive design.
        </p>
      </div>
      
      {/* Theme Toggle Demo */}
      <section className={styles.section}>
        <h2>Theme System</h2>
        <div className={styles.themeDemo}>
          <p>Toggle between light and dark themes:</p>
          <div className={styles.themeControls}>
            <ThemeToggle size="small" showLabel />
            <ThemeToggle size="medium" showLabel />
            <ThemeToggle size="large" showLabel />
          </div>
        </div>
      </section>

      {/* Button Components */}
      <section className={styles.section}>
        <h2>Buttons</h2>
        <div className={styles.componentGrid}>
          <div className={styles.componentGroup}>
            <h3>Variants</h3>
            <div className={styles.buttonRow}>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </div>
          
          <div className={styles.componentGroup}>
            <h3>Sizes</h3>
            <div className={styles.buttonRow}>
              <Button size="small">Small</Button>
              <Button size="medium">Medium</Button>
              <Button size="large">Large</Button>
            </div>
          </div>
          
          <div className={styles.componentGroup}>
            <h3>States</h3>
            <div className={styles.buttonColumn}>
              <div className={styles.buttonRow}>
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
              </div>
              <Button fullWidth>Full Width</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Input Components */}
      <section className={styles.section}>
        <h2>Inputs</h2>
        <div className={styles.inputGrid}>
          <Input
            label="Basic Input"
            placeholder="Enter some text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          
          <Input
            label="Required Input with Validation"
            placeholder="Enter at least 3 characters"
            validation={{
              required: true,
              minLength: 3,
            }}
            onValidation={handleInputValidation}
            error={inputError}
          />
          
          <Input
            label="Email Input"
            type="email"
            placeholder="Enter your email"
            validation={{
              required: true,
              pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            }}
            helperText="We'll never share your email"
          />
          
          <Input
            label="Input with Icons"
            placeholder="Search..."
            leftIcon={<span>🔍</span>}
            rightIcon={<span>✨</span>}
          />
          
          <Input
            label="Disabled Input"
            placeholder="This is disabled"
            disabled
            value="Disabled value"
          />
        </div>
      </section>

      {/* Modal Component */}
      <section className={styles.section}>
        <h2>Modal</h2>
        <div className={styles.modalDemo}>
          <Button onClick={() => setIsModalOpen(true)}>
            Open Modal
          </Button>
          <p className={styles.demoNote}>
            {isMobile ? 'On mobile, modals adapt to smaller screens' : 'Click to see the modal with responsive behavior'}
          </p>
        </div>
        
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Demo Modal"
          size="medium"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>
                Confirm
              </Button>
            </>
          }
        >
          <p>This is a demo modal with portal rendering.</p>
          <p>It includes:</p>
          <ul style={{ textAlign: 'left' }}>
            <li>Focus trapping</li>
            <li>Escape key handling</li>
            <li>Overlay click to close</li>
            <li>Accessibility features</li>
          </ul>
        </Modal>
      </section>

      {/* Loading Components */}
      <section className={styles.section}>
        <h2>Loading States</h2>
        
        <div className={styles.loadingDemo}>
          <div className={styles.componentGroup}>
            <h3>Spinners</h3>
            <div className={styles.loadingRow}>
              <Loading size="small" />
              <Loading size="medium" />
              <Loading size="large" />
              <Loading size="xlarge" />
            </div>
          </div>
          
          <div className={styles.componentGroup}>
            <h3>Variants</h3>
            <div className={styles.loadingColumn}>
              <Loading variant="spinner" text="Loading..." />
              <Loading variant="dots" text="Processing..." />
              <Loading variant="pulse" text="Please wait..." />
            </div>
          </div>
          
          <div className={styles.componentGroup}>
            <h3>Colors</h3>
            <div className={styles.loadingRow}>
              <Loading color="primary" />
              <Loading color="secondary" />
              <Loading color="dark" />
            </div>
          </div>
          
          <div className={styles.componentGroup}>
            <h3>Skeleton Loading</h3>
            <div className={styles.skeletonDemo}>
              <Skeleton height="2rem" />
              <Skeleton height="1rem" width="80%" />
              <Skeleton height="1rem" width="60%" />
              <div className={styles.skeletonRow}>
                <Skeleton variant="circular" width="3rem" height="3rem" />
                <div className={styles.skeletonContent}>
                  <Skeleton height="1rem" />
                  <Skeleton height="0.75rem" width="70%" />
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.componentGroup}>
            <h3>Overlay Loading</h3>
            <Button onClick={simulateLoading} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Simulate Loading'}
            </Button>
            {isLoading && (
              <div className={styles.overlayDemo}>
                <Loading overlay text="Loading content..." />
                <p>This content is behind a loading overlay</p>
                <p>The overlay will disappear after 3 seconds</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Error Handling Demo */}
      <section className={styles.section}>
        <h2>Error Handling</h2>
        <ErrorExample />
      </section>

      {/* Responsive Demo */}
      <section className={styles.section}>
        <h2>Responsive Design</h2>
        <div className={styles.responsiveDemo}>
          <div className={styles.deviceInfo}>
            <h3>Current Breakpoint</h3>
            <p>
              {isMobile && 'Mobile (< 768px)'}
              {isTablet && 'Tablet (768px - 1023px)'}
              {!isMobile && !isTablet && 'Desktop (≥ 1024px)'}
            </p>
            <p className={styles.demoNote}>
              Resize your browser window to see responsive behavior in action.
            </p>
          </div>
          
          <div className={styles.responsiveGrid}>
            <div className={styles.gridItem}>Item 1</div>
            <div className={styles.gridItem}>Item 2</div>
            <div className={styles.gridItem}>Item 3</div>
            <div className={styles.gridItem}>Item 4</div>
            <div className={styles.gridItem}>Item 5</div>
            <div className={styles.gridItem}>Item 6</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ComponentDemo;