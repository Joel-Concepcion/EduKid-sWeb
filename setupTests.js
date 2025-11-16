// src/setupTests.js
import '@testing-library/jest-dom';
import { jest, global} from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock para alert
global.alert = jest.fn();