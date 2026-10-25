import React from 'react';
import { useWindowDimensions } from 'react-native';
import { BottomSheet } from './BottomSheet';
import { PaywallContent } from '../PaywallContent';

export const PaywallModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const { height } = useWindowDimensions();
  return (
    <BottomSheet visible={visible} onClose={onClose} height={height * 0.94} dragFromHandleOnly>
      {visible && <PaywallContent onClose={onClose} onUnlocked={onClose} />}
    </BottomSheet>
  );
};
