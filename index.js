
/**
 * @file index.js
 * @version 2.0.0
 * @author WeirdGoalieDad / Lindsay Cole
 * @dedication For Caden and Ryker.
 * @description Main entry point for the React Native application.
 */
import 'react-native-gesture-handler'; // Must be at the top
import {AppRegistry} from 'react-native';
import AppWrapper from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => AppWrapper);
