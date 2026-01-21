const React = require('react');
const { View } = require('react-native');

const Mock = props => React.createElement(View, props, props.children);

module.exports = {
  __esModule: true,
  default: Mock,
  Svg: Mock,
  Circle: Mock,
  Rect: Mock,
  Path: Mock,
  Defs: Mock,
  LinearGradient: Mock,
  Stop: Mock,
  G: Mock,
};
